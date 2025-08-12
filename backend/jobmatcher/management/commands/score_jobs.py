"""
Management command to score jobs for all users or specific user
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from jobscraper.models import JobPosting
from fyndr_auth.models import JobSeekerProfile
from jobmatcher.engine import bulk_score_jobs


class Command(BaseCommand):
    help = 'Score jobs for users using the AI matching engine'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Score jobs for specific user ID only',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Limit number of jobs to score (default: 100)',
        )
        parser.add_argument(
            '--update-existing',
            action='store_true',
            help='Update existing job scores',
        )
        parser.add_argument(
            '--min-score',
            type=float,
            default=0.0,
            help='Only show results with score >= this value',
        )
    
    def handle(self, *args, **options):
        user_id = options.get('user_id')
        limit = options.get('limit')
        update_existing = options.get('update_existing')
        min_score = options.get('min_score')
        
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
        
        # Get jobs to score
        jobs = JobPosting.objects.filter(is_active=True)[:limit]
        self.stdout.write(f"Scoring {jobs.count()} jobs")
        
        total_scores = 0
        
        for user_profile in users:
            try:
                self.stdout.write(f"\nScoring jobs for: {user_profile.user.email}")
                
                # Score jobs for this user
                job_scores = bulk_score_jobs(
                    jobs=list(jobs),
                    user_profile=user_profile,
                    update_existing=update_existing
                )
                
                # Show top matches
                top_matches = [score for score in job_scores if score.score >= min_score]
                top_matches.sort(key=lambda x: x.score, reverse=True)
                
                if top_matches:
                    self.stdout.write(f"  Created/updated {len(job_scores)} scores")
                    self.stdout.write(f"  Top matches (score >= {min_score}):")
                    
                    for i, job_score in enumerate(top_matches[:5]):
                        self.stdout.write(
                            f"    {i+1}. {job_score.job.title} at {job_score.job.company} - {job_score.score}%"
                        )
                else:
                    self.stdout.write(f"  No matches found with score >= {min_score}")
                
                total_scores += len(job_scores)
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error processing user {user_profile.id}: {str(e)}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"\nCompleted! Total job scores: {total_scores}")
        )
