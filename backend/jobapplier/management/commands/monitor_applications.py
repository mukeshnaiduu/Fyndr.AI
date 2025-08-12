"""
Real-time Application Monitoring Management Command

This command runs continuously to monitor job applications and track status changes.
"""

import asyncio
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
from jobapplier.models import Application, ApplicationStatusHistory
from jobapplier.real_time_service import RealTimeApplicationService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Monitor job applications in real-time for status updates'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=300,  # 5 minutes
            help='Monitoring interval in seconds (default: 300)'
        )
        parser.add_argument(
            '--max-iterations',
            type=int,
            default=0,  # 0 = infinite
            help='Maximum iterations to run (0 for infinite)'
        )
        parser.add_argument(
            '--application-id',
            type=str,
            help='Monitor specific application ID only'
        )
    
    def handle(self, *args, **options):
        interval = options['interval']
        max_iterations = options['max_iterations']
        specific_app_id = options.get('application_id')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Starting real-time application monitoring (interval: {interval}s)'
            )
        )
        
        if specific_app_id:
            self.stdout.write(f'Monitoring specific application: {specific_app_id}')
        
        # Initialize service
        service = RealTimeApplicationService()
        iteration = 0
        
        try:
            while True:
                iteration += 1
                
                if max_iterations > 0 and iteration > max_iterations:
                    break
                
                self.stdout.write(f'Monitoring iteration {iteration} - {timezone.now()}')
                
                # Run monitoring cycle
                results = asyncio.run(self._monitor_cycle(service, specific_app_id))
                
                # Report results
                self._report_monitoring_results(results)
                
                # Sleep until next iteration
                if max_iterations == 0 or iteration < max_iterations:
                    self.stdout.write(f'Sleeping for {interval} seconds...')
                    asyncio.run(asyncio.sleep(interval))
        
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Monitoring stopped by user'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Monitoring failed: {e}'))
            logger.error(f'Application monitoring command failed: {e}')
    
    async def _monitor_cycle(self, service: RealTimeApplicationService, specific_app_id: str = None) -> List[Dict[str, Any]]:
        """Run one monitoring cycle for all active applications."""
        results = []
        
        try:
            # Get applications to monitor
            applications_to_monitor = self._get_applications_to_monitor(specific_app_id)
            
            for app_data in applications_to_monitor:
                try:
                    # Monitor application status
                    result = await service.monitor_application_status(app_data['application_id'])
                    
                    result['app_data'] = app_data
                    results.append(result)
                    
                    # Small delay between applications
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error monitoring application {app_data['application_id']}: {e}")
                    results.append({
                        'success': False,
                        'application_id': app_data['application_id'],
                        'error': str(e),
                        'app_data': app_data
                    })
        
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
            
        return results
    
    def _get_applications_to_monitor(self, specific_app_id: str = None) -> List[Dict[str, Any]]:
        """Get list of applications that should be monitored."""
        applications = []
        
        try:
            if specific_app_id:
                # Monitor specific application
                monitor_data = cache.get(f"monitor_app_{specific_app_id}")
                if monitor_data and monitor_data.get('monitoring_active'):
                    applications.append(monitor_data)
            else:
                # Get all applications being monitored from cache
                # This is a simplified approach - in production, you might want to 
                # store monitoring state in database
                
                # Get recently applied applications that might need monitoring
                recent_applications = Application.objects.filter(
                    applied_at__gte=timezone.now() - timedelta(days=30),
                    status__in=['pending', 'applied']
                ).values_list('application_id', flat=True)
                
                for app_id in recent_applications:
                    monitor_data = cache.get(f"monitor_app_{app_id}")
                    if monitor_data and monitor_data.get('monitoring_active'):
                        applications.append(monitor_data)
        
        except Exception as e:
            logger.error(f"Error getting applications to monitor: {e}")
            
        return applications
    
    def _report_monitoring_results(self, results: List[Dict[str, Any]]):
        """Report monitoring results to console."""
        if not results:
            self.stdout.write('No applications to monitor')
            return
        
        total_monitored = len(results)
        successful_checks = len([r for r in results if r.get('success')])
        status_updates_found = len([r for r in results if r.get('success') and r.get('status_updates')])
        
        self.stdout.write(
            f'Monitored {total_monitored} applications - '
            f'{successful_checks} successful checks - '
            f'{status_updates_found} status updates found'
        )
        
        # Report specific status updates
        for result in results:
            if result.get('success') and result.get('status_updates'):
                app_id = result['application_id']
                updates = result['status_updates']
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Application {app_id}: {len(updates)} status updates found'
                    )
                )
                
                for update in updates:
                    self.stdout.write(
                        f'  - {update["status"]} ({update["source"]}) - {update.get("notes", "")}'
                    )
        
        # Report errors
        for result in results:
            if not result.get('success'):
                app_id = result.get('application_id', 'unknown')
                error = result.get('error', 'Unknown error')
                
                self.stdout.write(
                    self.style.ERROR(f'Application {app_id}: {error}')
                )
