# Fyndr.AI Backend

Django REST API backend for the Fyndr.AI intelligent hiring platform.

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL (or Supabase)
- Redis (optional, for caching)

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   # For development
   pip install -r requirements-dev.txt
   
   # For production
   pip install -r requirements-prod.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server:**
   ```bash
   python manage.py runserver
   ```

## Development

### Using Makefile

We provide a Makefile for common tasks:

```bash
make help              # Show available commands
make install-dev       # Install development dependencies
make run              # Run development server
make test             # Run tests
make lint             # Run linting
make format           # Format code
make migrate          # Run migrations
make makemigrations   # Create migrations
```

### Code Quality

We use several tools to maintain code quality:

- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking
- **pytest**: Testing

Run all quality checks:
```bash
make lint
make format-check
make test
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=your_user
SUPABASE_DB_PASSWORD=your_password
SUPABASE_DB_HOST=your_host
SUPABASE_DB_PORT=6543

# Django
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## API Documentation

- **Development**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **JSON Schema**: http://localhost:8000/api/schema/

## Project Structure

```
backend/
├── fyndr_backend/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── fyndr_auth/             # Authentication app
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Development dependencies
├── requirements-prod.txt   # Production-only dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── manage.py             # Django management script
```

## Testing

Run tests:
```bash
# Run all tests
python manage.py test

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
python manage.py test fyndr_auth.tests.test_views
```

## Deployment

### Production Setup

1. **Install production dependencies:**
   ```bash
   pip install -r requirements-prod.txt
   ```

2. **Set environment variables:**
   ```bash
   export DEBUG=False
   export ALLOWED_HOSTS=yourdomain.com
   # Set other production variables
   ```

3. **Collect static files:**
   ```bash
   python manage.py collectstatic
   ```

4. **Run with Gunicorn:**
   ```bash
   gunicorn fyndr_backend.wsgi:application --bind 0.0.0.0:8000
   ```

### Docker (Optional)

```bash
# Build image
make docker-build

# Run container
make docker-run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run quality checks: `make lint && make test`
5. Submit a pull request

## License

This project is licensed under the MIT License.
