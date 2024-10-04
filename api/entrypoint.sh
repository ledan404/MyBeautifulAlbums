#!/bin/sh
python manage.py makemigrations user albums
python manage.py migrate
gunicorn MyBeautifulAlbums.wsgi:application 