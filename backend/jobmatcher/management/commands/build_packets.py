"""
Management command to build job packets for users
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from fyndr_auth.models import JobSeekerProfile
from jobmatcher.packet_builder import build_bulk_packets, get_user_packets_summary


class Command(BaseCommand):
    help = 'Build job application packets for users'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Build packets for specific user ID only',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Limit number of packets to build per user (default: 10)',
        )
        parser.add_argument(
            '--min-score',
            type=float,
            default=50.0,
            help='Minimum match score for packet building (default: 50.0)',
        )
        parser.add_argument(
            '--summary-only',
            action='store_true',
            help='Only show summary of existing packets without building new ones',
        )
    
    def handle(self, *args, **options):
        user_id = options.get('user_id')
        limit = options.get('limit')
        min_score = options.get('min_score')
        summary_only = options.get('summary_only')
        
        # Get users to process
        if user_id:
            try:
                users = [JobSeekerProfile.objects.get(id=user_id)]
                self.stdout.write(f"Processing user ID: {user_id}")
            except JobSeekerProfile.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"User with ID {user_id} not found")
                )
                return
        else:
            users = JobSeekerProfile.objects.all()
            self.stdout.write(f"Processing {users.count()} users")
        
        total_packets = 0
        
        for user_profile in users:
            try:
                self.stdout.write(f"\n📊 User: {user_profile.user.email}")
                
                if summary_only:
                    # Just show summary
                    summary = get_user_packets_summary(user_profile)
                    self.display_summary(summary)
                else:
                    # Build packets
                    self.stdout.write(f"Building up to {limit} packets (min score: {min_score})")
                    
                    prepared_jobs = build_bulk_packets(
                        user_profile=user_profile,
                        job_limit=limit,
                        min_score=min_score
                    )
                    
                    if prepared_jobs:
                        self.stdout.write(f"  ✅ Built {len(prepared_jobs)} packets")
                        
                        # Show top packets
                        for i, packet in enumerate(prepared_jobs[:3]):
                            status = "🟢 Ready" if packet.packet_ready else "🟡 Draft"
                            score = packet.job_score.score if packet.job_score else 0
                            self.stdout.write(
                                f"    {i+1}. {packet.job.title} at {packet.job.company} - {score}% {status}"
                            )
                        
                        if len(prepared_jobs) > 3:
                            self.stdout.write(f"    ... and {len(prepared_jobs) - 3} more packets")
                    else:
                        self.stdout.write("  ⚠️  No packets built (no suitable matches found)")
                    
                    total_packets += len(prepared_jobs)
                    
                    # Show updated summary
                    summary = get_user_packets_summary(user_profile)
                    self.display_summary(summary)
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error processing user {user_profile.id}: {str(e)}")
                )
        
        if not summary_only:
            self.stdout.write(
                self.style.SUCCESS(f"\nCompleted! Total packets built: {total_packets}")
            )
    
    def display_summary(self, summary):
        """Display packet summary for a user"""
        if 'error' in summary:
            self.stdout.write(f"  ❌ Error: {summary['error']}")
            return
        
        self.stdout.write(f"  📦 Total packets: {summary['total_packets']}")
        self.stdout.write(f"  ✅ Ready to apply: {summary['ready_to_apply']}")
        
        if summary['total_packets'] > 0:
            self.stdout.write(f"  📈 Average score: {summary['average_score']:.1f}%")
            self.stdout.write(f"  🔥 High priority: {summary['high_priority']}")
            self.stdout.write(f"  🔶 Medium priority: {summary['medium_priority']}")
            self.stdout.write(f"  🔹 Low priority: {summary['low_priority']}")
            
            if summary['top_matches']:
                self.stdout.write("  🎯 Top matches:")
                for match in summary['top_matches'][:3]:
                    status = "✅" if match['packet_ready'] else "📝"
                    self.stdout.write(f"     {status} {match['job_title']} at {match['company']} ({match['score']}%)")
