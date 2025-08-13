"""
Management command to enhance job scores and packets with AI
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from fyndr_auth.models import JobSeekerProfile
from jobmatcher.models import JobScore, PreparedJob
from jobmatcher.ai_service import enhance_job_score_with_ai, enhance_prepared_job_with_ai
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Enhance job scores and packets with AI-generated content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Enhance only for specific user ID'
        )
        parser.add_argument(
            '--enhance-scores',
            action='store_true',
            help='Enhance job scores with AI reasoning'
        )
        parser.add_argument(
            '--enhance-packets',
            action='store_true',
            help='Enhance job packets with AI content'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Maximum number of items to enhance (default: 100)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be enhanced without making changes'
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        enhance_scores = options.get('enhance_scores', False)
        enhance_packets = options.get('enhance_packets', False)
        limit = options.get('limit', 100)
        dry_run = options.get('dry_run', False)

        if not enhance_scores and not enhance_packets:
            enhance_scores = enhance_packets = True
            self.stdout.write("No specific enhancement type specified. Enhancing both scores and packets.")

        # Get user profiles to process
        if user_id:
            try:
                user_profiles = [JobSeekerProfile.objects.get(user__id=user_id)]
                self.stdout.write(f"Processing user ID: {user_id}")
            except JobSeekerProfile.DoesNotExist:
                raise CommandError(f"User profile with ID {user_id} not found")
        else:
            user_profiles = JobSeekerProfile.objects.all()
            self.stdout.write(f"Processing all user profiles ({user_profiles.count()} total)")

        total_enhanced_scores = 0
        total_enhanced_packets = 0
        total_errors = 0

        for user_profile in user_profiles:
            self.stdout.write(f"\nProcessing user: {user_profile.user.username}")

            # Enhance job scores
            if enhance_scores:
                unenhanced_scores = JobScore.objects.filter(
                    user_profile=user_profile,
                    ai_reasoning__isnull=True
                )[:limit]

                self.stdout.write(f"  Found {unenhanced_scores.count()} job scores to enhance")

                if not dry_run:
                    for job_score in unenhanced_scores:
                        try:
                            with transaction.atomic():
                                enhance_job_score_with_ai(
                                    job_score.job, 
                                    user_profile, 
                                    job_score
                                )
                                total_enhanced_scores += 1
                                self.stdout.write(f"    ✓ Enhanced score for {job_score.job.title}")
                        except Exception as e:
                            total_errors += 1
                            self.stdout.write(
                                self.style.ERROR(f"    ✗ Failed to enhance score {job_score.id}: {e}")
                            )
                else:
                    total_enhanced_scores += unenhanced_scores.count()

            # Enhance job packets
            if enhance_packets:
                unenhanced_packets = PreparedJob.objects.filter(
                    user_profile=user_profile,
                    ai_customization_notes__isnull=True,
                    packet_ready=True
                )[:limit]

                self.stdout.write(f"  Found {unenhanced_packets.count()} job packets to enhance")

                if not dry_run:
                    for packet in unenhanced_packets:
                        try:
                            with transaction.atomic():
                                enhance_prepared_job_with_ai(packet)
                                total_enhanced_packets += 1
                                self.stdout.write(f"    ✓ Enhanced packet for {packet.job.title}")
                        except Exception as e:
                            total_errors += 1
                            self.stdout.write(
                                self.style.ERROR(f"    ✗ Failed to enhance packet {packet.id}: {e}")
                            )
                else:
                    total_enhanced_packets += unenhanced_packets.count()

        # Summary
        self.stdout.write(f"\n{'=' * 50}")
        self.stdout.write(self.style.SUCCESS("AI Enhancement Summary:"))
        
        if dry_run:
            self.stdout.write(f"  Would enhance {total_enhanced_scores} job scores")
            self.stdout.write(f"  Would enhance {total_enhanced_packets} job packets")
            self.stdout.write("  (This was a dry run - no changes made)")
        else:
            self.stdout.write(f"  Enhanced {total_enhanced_scores} job scores")
            self.stdout.write(f"  Enhanced {total_enhanced_packets} job packets")
            if total_errors > 0:
                self.stdout.write(self.style.WARNING(f"  {total_errors} errors occurred"))
            else:
                self.stdout.write(self.style.SUCCESS("  All enhancements completed successfully!"))
