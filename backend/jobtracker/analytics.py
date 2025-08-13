"""
Analytics and metrics module for job application tracking.

This module provides comprehensive analytics functions for tracking
application performance, conversion rates, and success metrics.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone

logger = logging.getLogger(__name__)


class ApplicationAnalytics:
    """
    Main analytics class for application tracking and metrics.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def get_application_counts(self, 
                             user_profile=None, 
                             time_range: str = "30d",
                             start_date: datetime = None,
                             end_date: datetime = None) -> Dict[str, Any]:
        """
        Get application counts by status within a time range.
        
        Args:
            user_profile: UserProfile instance to filter by user
            time_range: Predefined time range ("7d", "30d", "90d", "6m", "1y")
            start_date: Custom start date (overrides time_range)
            end_date: Custom end date (overrides time_range)
            
        Returns:
            Dict with application counts and percentages
        """
        try:
            from jobapplier.models import Application
            
            # Calculate date range
            if start_date and end_date:
                date_filter = Q(applied_at__gte=start_date, applied_at__lte=end_date)
            else:
                start_date, end_date = self._get_date_range(time_range)
                date_filter = Q(applied_at__gte=start_date, applied_at__lte=end_date)
            
            # Base queryset
            queryset = Application.objects.filter(date_filter)
            if user_profile:
                queryset = queryset.filter(user_profile=user_profile)
            
            # Count by status
            status_counts = queryset.values('status').annotate(count=Count('status'))
            
            # Process results
            counts = {
                'applied': 0,
                'interview': 0,
                'rejected': 0,
                'offer': 0,
                'withdrawn': 0,
                'pending': 0,
                'failed': 0,
                'accepted': 0,
                'declined': 0
            }
            
            total = 0
            for item in status_counts:
                status = item['status']
                count = item['count']
                if status in counts:
                    counts[status] = count
                total += count
            
            # Calculate percentages
            percentages = {}
            for status, count in counts.items():
                percentages[status] = round((count / total * 100) if total > 0 else 0, 1)
            
            # Calculate derived metrics
            successful_statuses = ['interview', 'offer', 'accepted']
            unsuccessful_statuses = ['rejected', 'failed', 'declined']
            
            successful_count = sum(counts[status] for status in successful_statuses)
            unsuccessful_count = sum(counts[status] for status in unsuccessful_statuses)
            
            return {
                'counts': counts,
                'percentages': percentages,
                'total_applications': total,
                'successful_applications': successful_count,
                'unsuccessful_applications': unsuccessful_count,
                'pending_applications': counts['applied'] + counts['pending'],
                'success_rate': round((successful_count / total * 100) if total > 0 else 0, 1),
                'response_rate': round(((successful_count + unsuccessful_count) / total * 100) if total > 0 else 0, 1),
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'range': time_range
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating application counts: {e}")
            return self._empty_counts_response(time_range)
    
    def get_conversion_rate(self, user_profile=None, time_range: str = "90d") -> Dict[str, Any]:
        """
        Calculate conversion rates through the application funnel.
        
        Args:
            user_profile: UserProfile instance to filter by user
            time_range: Time range for analysis
            
        Returns:
            Dict with conversion rates and funnel metrics
        """
        try:
            from jobapplier.models import Application
            
            start_date, end_date = self._get_date_range(time_range)
            date_filter = Q(applied_at__gte=start_date, applied_at__lte=end_date)
            
            queryset = Application.objects.filter(date_filter)
            if user_profile:
                queryset = queryset.filter(user_profile=user_profile)
            
            # Count applications at each stage
            total_applied = queryset.count()
            total_responses = queryset.filter(
                Q(status__in=['interview', 'rejected', 'offer', 'accepted', 'declined'])
            ).count()
            total_interviews = queryset.filter(status='interview').count()
            total_offers = queryset.filter(status__in=['offer', 'accepted']).count()
            total_accepted = queryset.filter(status='accepted').count()
            
            # Calculate conversion rates
            if total_applied > 0:
                response_rate = round((total_responses / total_applied) * 100, 1)
                interview_rate = round((total_interviews / total_applied) * 100, 1)
                offer_rate = round((total_offers / total_applied) * 100, 1)
                acceptance_rate = round((total_accepted / total_applied) * 100, 1)
            else:
                response_rate = interview_rate = offer_rate = acceptance_rate = 0.0
            
            # Interview to offer conversion
            interview_to_offer_rate = round((total_offers / total_interviews) * 100, 1) if total_interviews > 0 else 0.0
            
            return {
                'funnel_metrics': {
                    'total_applied': total_applied,
                    'total_responses': total_responses,
                    'total_interviews': total_interviews,
                    'total_offers': total_offers,
                    'total_accepted': total_accepted
                },
                'conversion_rates': {
                    'response_rate': response_rate,
                    'interview_rate': interview_rate,
                    'offer_rate': offer_rate,
                    'acceptance_rate': acceptance_rate,
                    'interview_to_offer_rate': interview_to_offer_rate
                },
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'range': time_range
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating conversion rate: {e}")
            return {
                'funnel_metrics': {},
                'conversion_rates': {},
                'period': {'range': time_range},
                'error': str(e)
            }
    
    def get_top_sources_by_success(self, 
                                  user_profile=None, 
                                  time_range: str = "90d",
                                  limit: int = 10) -> Dict[str, Any]:
        """
        Get top job sources ranked by success rate.
        
        Args:
            user_profile: UserProfile instance to filter by user
            time_range: Time range for analysis
            limit: Maximum number of sources to return
            
        Returns:
            Dict with ranked job sources and their success metrics
        """
        try:
            from jobapplier.models import Application
            
            start_date, end_date = self._get_date_range(time_range)
            date_filter = Q(applied_at__gte=start_date, applied_at__lte=end_date)
            
            queryset = Application.objects.filter(date_filter)
            if user_profile:
                queryset = queryset.filter(user_profile=user_profile)
            
            # Group by job source (assuming job has a source field)
            sources = {}
            
            for application in queryset.select_related('job'):
                source = getattr(application.job, 'source', 'Unknown')
                
                if source not in sources:
                    sources[source] = {
                        'total_applications': 0,
                        'successful_applications': 0,
                        'interviews': 0,
                        'offers': 0,
                        'rejections': 0
                    }
                
                sources[source]['total_applications'] += 1
                
                if application.status in ['interview', 'offer', 'accepted']:
                    sources[source]['successful_applications'] += 1
                
                if application.status == 'interview':
                    sources[source]['interviews'] += 1
                elif application.status in ['offer', 'accepted']:
                    sources[source]['offers'] += 1
                elif application.status in ['rejected', 'failed', 'declined']:
                    sources[source]['rejections'] += 1
            
            # Calculate success rates and rank sources
            ranked_sources = []
            for source, metrics in sources.items():
                total = metrics['total_applications']
                successful = metrics['successful_applications']
                
                success_rate = (successful / total * 100) if total > 0 else 0
                
                ranked_sources.append({
                    'source': source,
                    'total_applications': total,
                    'successful_applications': successful,
                    'interviews': metrics['interviews'],
                    'offers': metrics['offers'],
                    'rejections': metrics['rejections'],
                    'success_rate': round(success_rate, 1),
                    'response_rate': round(((successful + metrics['rejections']) / total * 100) if total > 0 else 0, 1)
                })
            
            # Sort by success rate, then by total applications
            ranked_sources.sort(key=lambda x: (-x['success_rate'], -x['total_applications']))
            
            return {
                'ranked_sources': ranked_sources[:limit],
                'total_sources': len(ranked_sources),
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'range': time_range
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating top sources: {e}")
            return {
                'ranked_sources': [],
                'total_sources': 0,
                'period': {'range': time_range},
                'error': str(e)
            }
    
    def get_application_timeline(self, 
                               user_profile=None, 
                               time_range: str = "30d",
                               granularity: str = "day") -> Dict[str, Any]:
        """
        Get application timeline data for charts and graphs.
        
        Args:
            user_profile: UserProfile instance to filter by user
            time_range: Time range for analysis
            granularity: Time granularity ("day", "week", "month")
            
        Returns:
            Dict with timeline data points
        """
        try:
            from jobapplier.models import Application
            
            start_date, end_date = self._get_date_range(time_range)
            date_filter = Q(applied_at__gte=start_date, applied_at__lte=end_date)
            
            queryset = Application.objects.filter(date_filter)
            if user_profile:
                queryset = queryset.filter(user_profile=user_profile)
            
            # Choose appropriate truncation function
            if granularity == "week":
                trunc_func = TruncWeek
            elif granularity == "month":
                trunc_func = TruncMonth
            else:
                trunc_func = TruncDate
            
            # Get timeline data
            timeline_data = (queryset
                           .annotate(period=trunc_func('applied_at'))
                           .values('period')
                           .annotate(total=Count('application_id'))
                           .order_by('period'))
            
            # Format timeline data
            timeline = []
            for item in timeline_data:
                timeline.append({
                    'date': item['period'].isoformat(),
                    'applications': item['total']
                })
            
            return {
                'timeline': timeline,
                'granularity': granularity,
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'range': time_range
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating timeline: {e}")
            return {
                'timeline': [],
                'granularity': granularity,
                'period': {'range': time_range},
                'error': str(e)
            }
    
    def get_comprehensive_analytics(self, 
                                  user_profile=None, 
                                  time_range: str = "30d") -> Dict[str, Any]:
        """
        Get comprehensive analytics summary combining all metrics.
        
        Args:
            user_profile: UserProfile instance to filter by user
            time_range: Time range for analysis
            
        Returns:
            Dict with all analytics data
        """
        return {
            'application_counts': self.get_application_counts(user_profile, time_range),
            'conversion_rates': self.get_conversion_rate(user_profile, time_range),
            'top_sources': self.get_top_sources_by_success(user_profile, time_range),
            'timeline': self.get_application_timeline(user_profile, time_range),
            'generated_at': timezone.now().isoformat()
        }
    
    def _get_date_range(self, time_range: str) -> Tuple[datetime, datetime]:
        """
        Convert time range string to start and end dates.
        
        Args:
            time_range: Time range string ("7d", "30d", "90d", "6m", "1y")
            
        Returns:
            Tuple of (start_date, end_date)
        """
        end_date = timezone.now()
        
        if time_range == "7d":
            start_date = end_date - timedelta(days=7)
        elif time_range == "30d":
            start_date = end_date - timedelta(days=30)
        elif time_range == "90d":
            start_date = end_date - timedelta(days=90)
        elif time_range == "6m":
            start_date = end_date - timedelta(days=180)
        elif time_range == "1y":
            start_date = end_date - timedelta(days=365)
        else:
            # Default to 30 days
            start_date = end_date - timedelta(days=30)
        
        return start_date, end_date
    
    def _empty_counts_response(self, time_range: str) -> Dict[str, Any]:
        """Return empty response structure for error cases."""
        return {
            'counts': {status: 0 for status in ['applied', 'interview', 'rejected', 'offer', 'withdrawn', 'pending', 'failed', 'accepted', 'declined']},
            'percentages': {status: 0.0 for status in ['applied', 'interview', 'rejected', 'offer', 'withdrawn', 'pending', 'failed', 'accepted', 'declined']},
            'total_applications': 0,
            'successful_applications': 0,
            'unsuccessful_applications': 0,
            'pending_applications': 0,
            'success_rate': 0.0,
            'response_rate': 0.0,
            'period': {'range': time_range}
        }


# Convenience functions for easy access
def get_application_counts(user_profile=None, time_range: str = "30d") -> Dict[str, Any]:
    """
    Get application counts for a user within a time range.
    
    Returns JSON summary like:
    {
        "applied": 42,
        "interviews": 5,
        "offers": 1,
        "conversion_rate": "12%"
    }
    """
    analytics = ApplicationAnalytics()
    return analytics.get_application_counts(user_profile, time_range)


def get_conversion_rate(user_profile=None, time_range: str = "90d") -> Dict[str, Any]:
    """
    Get conversion rate metrics for a user.
    
    Returns JSON with funnel metrics and conversion percentages.
    """
    analytics = ApplicationAnalytics()
    return analytics.get_conversion_rate(user_profile, time_range)


def get_top_sources_by_success(user_profile=None, time_range: str = "90d") -> Dict[str, Any]:
    """
    Get top job sources ranked by success rate.
    
    Returns JSON with ranked sources and their performance metrics.
    """
    analytics = ApplicationAnalytics()
    return analytics.get_top_sources_by_success(user_profile, time_range)


def get_user_analytics_summary(user_profile, time_ranges: List[str] = None) -> Dict[str, Any]:
    """
    Get comprehensive analytics summary for a user across multiple time ranges.
    
    Args:
        user_profile: UserProfile instance
        time_ranges: List of time ranges to analyze (default: ["7d", "30d", "90d"])
        
    Returns:
        Dict with analytics for each time range
    """
    if time_ranges is None:
        time_ranges = ["7d", "30d", "90d"]
    
    analytics = ApplicationAnalytics()
    summary = {}
    
    for time_range in time_ranges:
        summary[time_range] = analytics.get_comprehensive_analytics(user_profile, time_range)
    
    return {
        'user_analytics': summary,
        'generated_at': timezone.now().isoformat()
    }


# Example usage and testing
if __name__ == "__main__":
    # Test analytics functions
    analytics = ApplicationAnalytics()
    
    # Test with no user (all applications)
    print("Application counts (last 30 days):")
    counts = analytics.get_application_counts(time_range="30d")
    print(counts)
    
    print("\nConversion rates (last 90 days):")
    conversion = analytics.get_conversion_rate(time_range="90d")
    print(conversion)
    
    print("\nTop sources by success:")
    sources = analytics.get_top_sources_by_success(time_range="90d")
    print(sources)
