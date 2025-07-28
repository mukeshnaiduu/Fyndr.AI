from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from .models import JobPosting
from .serializers import JobPostingSerializer, JobPostingListSerializer


class JobPostingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for JobPosting model providing read-only access to job data.
    Supports filtering, searching, and pagination.
    """
    queryset = JobPosting.objects.filter(is_active=True).order_by('-date_posted', '-date_scraped')
    serializer_class = JobPostingListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering options
    filterset_fields = {
        'source': ['exact', 'in'],
        'location': ['icontains', 'exact'],
        'company': ['icontains', 'exact'],
        'date_posted': ['gte', 'lte', 'exact'],
        'date_scraped': ['gte', 'lte', 'exact'],
    }
    
    # Search fields
    search_fields = ['title', 'company', 'location', 'description']
    
    # Ordering options
    ordering_fields = ['date_posted', 'date_scraped', 'title', 'company']
    ordering = ['-date_posted', '-date_scraped']
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve, list serializer for list."""
        if self.action == 'retrieve':
            return JobPostingSerializer
        return JobPostingListSerializer
    
    def get_queryset(self):
        """Custom queryset with additional filtering options."""
        queryset = super().get_queryset()
        
        # Filter by country (for India-specific jobs)
        country = self.request.query_params.get('country', None)
        if country:
            if country.lower() == 'india':
                # Filter for India locations
                india_keywords = [
                    'india', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai',
                    'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur',
                    'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri',
                    'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
                    'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi',
                    'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai',
                    'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur',
                    'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur',
                    'kota', 'gurgaon', 'chandigarh', 'solapur', 'hubli', 'tiruchirappalli',
                    'bareilly', 'mysore', 'tiruppur', 'guwahati', 'salem', 'mira',
                    'bhiwandi', 'saharanpur', 'gorakhpur', 'bikaner', 'amravati',
                    'noida', 'jamshedpur', 'bhilai', 'warangal', 'cuttack', 'firozabad',
                    'kochi', 'bhavnagar', 'dehradun', 'durgapur', 'asansol', 'rourkela',
                    'nanded', 'kolhapur', 'ajmer', 'akola', 'gulbarga', 'jamnagar',
                    'ujjain', 'loni', 'siliguri', 'jhansi', 'ulhasnagar', 'nellore',
                    'jammu', 'sangli', 'belgaum', 'mangalore', 'ambattur', 'tirunelveli',
                    'malegaon', 'gaya', 'jalgaon', 'udaipur', 'maheshtala'
                ]
                
                # Create Q objects for each keyword
                location_q = Q()
                for keyword in india_keywords:
                    location_q |= Q(location__icontains=keyword)
                
                queryset = queryset.filter(location_q)
        
        # Filter by employment type (extracted from description)
        employment_type = self.request.query_params.get('employment_type', None)
        if employment_type:
            if employment_type.lower() == 'full-time':
                queryset = queryset.filter(
                    Q(description__icontains='full-time') | Q(description__icontains='full time')
                )
            elif employment_type.lower() == 'part-time':
                queryset = queryset.filter(
                    Q(description__icontains='part-time') | Q(description__icontains='part time')
                )
            elif employment_type.lower() == 'contract':
                queryset = queryset.filter(description__icontains='contract')
            elif employment_type.lower() == 'internship':
                queryset = queryset.filter(description__icontains='intern')
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(date_posted__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_posted__lte=date_to)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about available jobs."""
        queryset = self.get_queryset()
        
        stats = {
            'total_jobs': queryset.count(),
            'companies': queryset.values('company').distinct().count(),
            'locations': queryset.values('location').distinct().count(),
            'sources': queryset.values('source').distinct().count(),
            'by_source': list(queryset.values('source').annotate(count=Count('id'))),
            'by_company': list(queryset.values('company').annotate(count=Count('id')).order_by('-count')[:10]),
            'by_location': list(queryset.values('location').annotate(count=Count('id')).order_by('-count')[:10]),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def filters(self, request):
        """Get available filter options."""
        queryset = self.get_queryset()
        
        filters_data = {
            'companies': list(queryset.values_list('company', flat=True).distinct().order_by('company')),
            'locations': list(queryset.values_list('location', flat=True).distinct().order_by('location')),
            'sources': list(queryset.values_list('source', flat=True).distinct().order_by('source')),
        }
        
        return Response(filters_data)
    
    @action(detail=False, methods=['get'])
    def india_jobs(self, request):
        """Get jobs specifically for India."""
        # Override the queryset to only include India jobs
        self.request.query_params = self.request.query_params.copy()
        self.request.query_params['country'] = 'india'
        
        return self.list(request)
