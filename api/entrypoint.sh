#!/bin/sh
python manage.py makemigrations user albums
pyththon manage.py makemigrations
python manage.py migrate user albums
python manage.py migrate
gunicorn MyBeautifulAlbums.wsgi:application
