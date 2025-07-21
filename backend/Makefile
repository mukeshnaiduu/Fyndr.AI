.PHONY: help install install-dev run test lint format clean migrate makemigrations shell createsuperuser collectstatic

# Default target
help:
	@echo "Available commands:"
	@echo "  install          Install production dependencies"
	@echo "  install-dev      Install development dependencies"
	@echo "  run              Run development server"
	@echo "  test             Run tests"
	@echo "  test-cov         Run tests with coverage"
	@echo "  lint             Run linting (flake8)"
	@echo "  format           Format code (black + isort)"
	@echo "  format-check     Check code formatting"
	@echo "  migrate          Run database migrations"
	@echo "  makemigrations   Create new migrations"
	@echo "  shell            Open Django shell"
	@echo "  createsuperuser  Create Django superuser"
	@echo "  collectstatic    Collect static files"
	@echo "  clean            Clean cache and temporary files"
	@echo "  reset-db         Reset database (danger!)"

# Installation
install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt

install-prod:
	pip install -r requirements-prod.txt

# Development
run:
	python manage.py runserver

shell:
	python manage.py shell

# Database
migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

createsuperuser:
	python manage.py createsuperuser

reset-db:
	python manage.py flush --noinput
	python manage.py migrate

# Static files
collectstatic:
	python manage.py collectstatic --noinput

# Testing
test:
	python manage.py test

test-cov:
	pytest --cov=. --cov-report=html --cov-report=term-missing

# Code quality
lint:
	flake8 .
	mypy .

format:
	black .
	isort .

format-check:
	black --check .
	isort --check-only .

# Utilities
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .coverage htmlcov/ .pytest_cache/ .mypy_cache/

# Docker commands (if using Docker)
docker-build:
	docker build -t fyndr-backend .

docker-run:
	docker run -p 8000:8000 fyndr-backend

# Deployment helpers
check:
	python manage.py check --deploy

# Backup and restore
backup-db:
	python manage.py dumpdata > backup.json

restore-db:
	python manage.py loaddata backup.json
