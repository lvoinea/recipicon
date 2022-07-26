# RECIPICON

TODO: About this application.

## Install

The recommended way to install the application is by making use of the
provided Docker image.

```shell script
docker pull ...
```

The application requires a `Docker` volume to store:
* two input configuration files (i.e., `app.ini` and `server_config.py`);
* the application (sqlite3) database;
* error and access logs.

For a simple configuration one can create a local host folder for mounting
the required `Docker` volume (e.g., `local/`). This folder should have 
read and write access for the group with id `9999`. The recommended way to
achieve this is to create the group in the host and add the user that will
launch the `Docker` container to that group. Then the group of the `local/`
folder and all its contents should be set to the newly added group. To get
all this done, one can use the following command sequence:

```shell script
sudo groupadd -g 9999 dockerapp
sudo usermod -a -G dockerapp $USER
mkdir local
find local -exec chgrp dockerapp {} +
find local -exec chmod g+rwx {} +
find local -exec chmod o-rwx {} +
```
> **NOTE** If group `9999` is not an option for adding locally, the 
> recommended resolution is to chose another group id and rebuild the
> `Docker` image, and not to open the `local/` folder for general rw
> access.

Once the folder is created, it should store the two required configuration
files:

* `server_config.py` for the backend server (Gunicorn). The location of 
   this file has to be provided to the `docker run` command as a command
   line parameter.
* `site.ini` for the application itself. The location of this file is to
   be passed as an environment variable inside `server_config.py`.

A recommended structure for the mounted folder is:

```shell script
local/
  |- config/
  |    |- site.ini
  |    |- server_config.py
  |- db/
  |- logs/
```

The `site.ini` file should have the following structure:

```shell script
[HOST]
serverHttpIp = the IP of the server where the site runs (e.g., 192.168.0.1)

[EMAIL]
serverSmtp = the host name of the SMTP server (e.g., mail.myserver.com)
serverPort = SMTP TLS port (e.g., 587)
serverFromEmail = from email address (e.g., support@recipicon.com)
serverFromName = from name (e.g., Recipicon Support)
serverPass = SMTP server pass (e.g., MySecretePass)
```

The `server_config.py` file should follow the Gunicorn guidelines as
specified at https://docs.gunicorn.org/en/stable/settings.html#settings
and should include at least the following settings:

```shell script
bind = '0.0.0.0:5000'
workers = 1
raw_env = [
    'DJANGO_SECRET_KEY=mysecret',
    'SITE_CONFIG=/storage/config/site.ini',
    'SITE_DB=/storage/db/db.sqlite3',
]
errorlog = '/storage/logs/error.log'
```
> **NOTE**: The `/storage` path above refers to the mount point of the 
> required `Docker` volume in a container.

## Run

Once the [Install](#install) procedure has been completed, and the storage
required for the `Docker` volume is appropriately configured, one can start
the application by issuing the command:

```shell script
docker run -d --rm \
    -p 8080:5000 \
    -v $(pwd)/local:/storage \
    recipicon /storage/config/server_config.py recipicon.wsgi
```

> **NOTE**: The command above assumes the required `Docker` volume is mounted
> in the `local/` host folder, relative to the current working folder.

## Development

### Set-up

Create and install development environment:
```shell script
virtualenv venv --python=python3
. venv/bin/activate
pip install -r requirements.txt
```

Set-up the database:
```shell script
. venv/bin/activate
python manage.py makemigrations api
python manage.py migrate
```

### Running

The recommended way to run the server during development is using the
Django development server:

```shell script
DJANGO_DEBUG=1 python manage.py runserver
```
Alternativelly, one can run the Gunicorn server to mimic the production
environemnt:

```shell script
gunicorn -c ./local/config/server_config_local.py recipicon.wsgi
```

### Building the deployment package

```shell script
docker build -f Docker/Dockerfile -t recipicon .
```

### Testing

* creating users
```shell script
python manage.py createsuperuser
```

* playing with the api
````shell script
python manage.py shell
````