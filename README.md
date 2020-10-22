# Basic Setup

Steps in setting up the Django project

### Create virtual env

```bash
mkvirtualenv --python=/usr/bin/python3.6 parcel_polyfarming
```
We use python 3.6 for this project. Once the environment is created, activate it and install dependencies

### Install dependencies

```bash
pip install -r requirements.txt
```
The current Django version is 3.1.2

### Database setup

This project uses Postgresql with spatial extensions.

Create a file called settings_local.py inside the parcel_polyfarming folder. It should reside at the same level as settings.py. The contents of the settings_local.py file should be something like this:

```python
import os

DEBUG=True

#ALLOWED_HOSTS=['127.0.0.1',]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASES = {
    'default': {
	    'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'database_name',
        'USER': 'database_user',
        'PASSWORD': 'database_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

(change database_user, database_password and database_name to appropiate values)

#### Create user and database

Login to postgres as admin user and create the database user: (change database_user, database_password and database_name to appropiate values)

```bash
psql
CREATE ROLE database_user LOGIN PASSWORD 'database_password' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
```

From the shell, as user postgres do the following:

```bash
createdb database_name -O database_user
psql -d database_name
create extension postgis;
create extension postgis_topology;
```

### Migrate database

Activate virtual enviroment and perform django migrations. If the database has been correctly configured and settings_local.py is in place, this should work. From inside of the root folder (at the same level as manage.py file), do:

```bash
workon parcel_polyfarming
./manage.py migrate
```

### Run project

From bash, do:

```bash
./manage.py runserver
```

This should start a dev instance running at 127.0.0.1:8000
