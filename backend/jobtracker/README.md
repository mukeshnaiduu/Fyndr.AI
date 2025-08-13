# Job Tracker Module

The Job Tracker module provides comprehensive application status tracking, analytics, and follow-up management for the Fyndr.AI platform.

## Overview

This module extends the basic job application functionality with:
- **Status History Tracking**: Complete audit trail of application status changes
- **Email Parsing**: Automated status updates from confirmation/rejection emails
- **ATS Integration**: Synchronization with Applicant Tracking Systems
- **Analytics Dashboard**: Insights into application performance and conversion rates
- **Follow-up Reminders**: Automated alerts for pending applications

## Architecture

### Models

#### ApplicationStatusHistory
Tracks all status changes for job applications:
- `application`: Foreign key to Application model
- `status`: Current status (APPLIED, INTERVIEW, REJECTED, OFFER, WITHDRAWN)
- `source`: How the status was updated (USER_MANUAL, EMAIL_PARSE, ATS_SYNC)
- `notes`: Optional notes about the status change
- `updated_at`: Timestamp of the status change

### Core Components

#### 1. Email Parser (`email_parser.py`)
Parses job-related emails to extract status updates:
```python
from jobtracker.email_parser import EmailStatusParser

parser = EmailStatusParser()
result = parser.parse_status_from_email(email_content)
# Returns: {'application_id': 123, 'status': 'interview', 'notes': '...'}
```

**Future Enhancements:**
- Gmail API integration
- AI/LLM-powered email classification
- Multi-provider email support (Outlook, Yahoo, etc.)

#### 2. ATS Synchronization (`ats_sync.py`)
Integrates with major ATS platforms:
```python
from jobtracker.ats_sync import sync_application_status

result = sync_application_status(application)
# Checks ATS for status updates and returns changes
```

**Supported ATS Platforms (Planned):**
- Greenhouse
- Lever
- Workday
- BambooHR
- SmartRecruiters

#### 3. Analytics Engine (`analytics.py`)
Provides comprehensive application analytics:
```python
from jobtracker.analytics import get_application_counts, get_conversion_rate

# Get application statistics
stats = get_application_counts(time_range='last_30_days')
# Returns: {"applied": 42, "interviews": 5, "offers": 1}

# Calculate conversion rates
rate = get_conversion_rate(user_profile)
# Returns: {"conversion_rate": 12, "total_applications": 42}
```

#### 4. Reminder System (`reminders.py`)
Manages follow-up tasks and reminders:
```python
from jobtracker.reminders import check_pending_applications

tasks = check_pending_applications(user_profile)
# Returns list of FollowUpTask objects with suggested actions
```

## API Endpoints

The module provides REST API endpoints for frontend integration:

### Application Statistics
```
GET /api/stats/summary?user_id=123&time_range=last_30_days
```
Returns application counts, conversion rates, and trends.

### Application History
```
GET /api/applications/<user_id>?status=all&limit=50
```
Returns paginated list of applications with status history.

### Status History
```
GET /api/application/<application_id>/status-history
```
Returns complete status change history for a specific application.

### Update Status
```
POST /api/application/<application_id>/status
{
  "status": "interview",
  "source": "user_manual",
  "notes": "Scheduled for next week"
}
```

## Management Commands

### Update Application Statuses
The main command for batch processing status updates:

```bash
# Basic usage - check all sources
python manage.py update_statuses

# Check only email updates
python manage.py update_statuses --source email

# Check only ATS updates
python manage.py update_statuses --source ats

# Process specific user
python manage.py update_statuses --user-id 123

# Dry run to see what would be updated
python manage.py update_statuses --dry-run

# Include follow-up reminder checks
python manage.py update_statuses --check-reminders

# Verbose output
python manage.py update_statuses --verbose
```

**Command Options:**
- `--source`: email, ats, or all (default: all)
- `--user-id`: Process only specific user
- `--days-back`: How many days to look back (default: 7)
- `--dry-run`: Show changes without applying them
- `--verbose`: Detailed output
- `--check-reminders`: Include follow-up task generation

## Setup and Configuration

### 1. Run Migrations
```bash
python manage.py makemigrations jobtracker
python manage.py migrate
```

### 2. Configure Email Integration (Future)
```python
# In settings.py
EMAIL_CONFIG = {
    'provider': 'gmail',
    'client_id': 'your-gmail-client-id',
    'client_secret': 'your-gmail-client-secret',
    'refresh_token': 'user-refresh-token'
}
```

### 3. Configure ATS Integration (Future)
```python
# In settings.py
ATS_CONFIG = {
    'greenhouse': {
        'api_key': 'your-greenhouse-api-key',
        'base_url': 'https://harvest.greenhouse.io/v1/'
    },
    'lever': {
        'api_key': 'your-lever-api-key',
        'base_url': 'https://api.lever.co/v1/'
    }
}
```

## Usage Examples

### 1. Track Manual Status Update
```python
from jobapplier.models import Application
from jobtracker.models import ApplicationStatusHistory

application = Application.objects.get(id=123)
ApplicationStatusHistory.objects.create(
    application=application,
    status='interview',
    source='user_manual',
    notes='Phone screening scheduled for Monday'
)
```

### 2. Get Application Analytics
```python
from jobtracker.analytics import get_application_counts

# Get last 30 days statistics
stats = get_application_counts('last_30_days')
print(f"Applied: {stats['applied']}")
print(f"Interviews: {stats['interviews']}")
print(f"Conversion Rate: {stats['conversion_rate']}%")
```

### 3. Check Follow-up Tasks
```python
from jobtracker.reminders import check_pending_applications

tasks = check_pending_applications()
for task in tasks:
    print(f"{task.priority}: {task.job_title} - {task.suggested_action}")
```

## Scheduled Tasks

Set up cron jobs for automated processing:

```bash
# Check for status updates every 4 hours
0 */4 * * * cd /path/to/project && python manage.py update_statuses

# Generate daily follow-up reports
0 9 * * * cd /path/to/project && python manage.py update_statuses --check-reminders
```

## Future Integrations

### AI-Powered Email Classification
- Integration with OpenAI/Claude for intelligent email parsing
- Custom training models for job-specific email patterns
- Multi-language support for international job markets

### Slack Integration
```python
# Future implementation
from jobtracker.integrations.slack import send_status_update

send_status_update(
    user_slack_id='U1234567',
    message='🎉 You got an interview at TechCorp!'
)
```

### Mobile Push Notifications
```python
# Future implementation
from jobtracker.integrations.push import send_push_notification

send_push_notification(
    user_id=123,
    title='Application Update',
    body='Your application status has changed!'
)
```

### Advanced Analytics
- Machine learning models for application success prediction
- Industry-specific conversion rate benchmarks
- Personalized application strategy recommendations

## Contributing

When extending the job tracker module:

1. **Models**: Add new tracking models in `models.py`
2. **Parsers**: Extend email parsing logic in `email_parser.py`
3. **ATS**: Add new ATS integrations in `ats_sync.py`
4. **Analytics**: Add metrics functions in `analytics.py`
5. **APIs**: Add endpoints in `views.py` and `urls.py`

### Testing
```bash
# Run job tracker tests
python manage.py test jobtracker

# Test specific components
python manage.py test jobtracker.tests.test_email_parser
python manage.py test jobtracker.tests.test_analytics
```

## Troubleshooting

### Common Issues

1. **Email parsing not working**
   - Check email provider API credentials
   - Verify email permissions and OAuth scopes
   - Check rate limiting and quotas

2. **ATS sync failures**
   - Validate ATS API keys and permissions
   - Check network connectivity to ATS endpoints
   - Review application ID mapping

3. **Missing status updates**
   - Run with `--verbose` flag to see detailed processing
   - Check application date ranges with `--days-back`
   - Verify user permissions and data access

### Logging
Enable detailed logging in `settings.py`:
```python
LOGGING = {
    'loggers': {
        'jobtracker': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

## Support

For issues or feature requests:
- Create an issue in the project repository
- Check the troubleshooting section above
- Review the management command help: `python manage.py update_statuses --help`
