#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser
python create_superuser.py

# Create media directory
mkdir -p media/products media/profiles