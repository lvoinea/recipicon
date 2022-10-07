# RECIPICON

**Recipicon** is a web-based application that enables users to document 
recipes and create shopping lists based on them. This use scenario is 
already covered by many similar applications (most online groceries stores
offer it). Neverthless, **Recipicon** has an interesting twist. It enables
users to organize the shopping list, such that items are listed in the order
of walking through a particular store. This enables users to optimize their
shopping experience for speed, specially when this involves visiting several
stores. 

### History

I've started this project in 2016 to solve a concrete problem I had at that 
time: I was spending a sizable chunk of my weekend making the dinner menu for
the coming week (we mostly cook the dinner ourselves) and shopping for 
groceries (we mostly do that once per week). Deciding on the menu was 
particularly frustrating as we like to go for variation as much as possible, 
but we tend to avoid surprises when under (work)stress. Having a good 
recollection of previous experiences was therefore needed. Once the menu was
clear, I was drafting the shopping list trying to group the items such that
I did not have to cris-cross the store, or double check the list again and 
again while picking-up the items. However, that did not work very well, as I was
usually visiting 2-3 stores before I could cross everything off the list.
Hence, more frustration added up while visiting same parts of the store
multiple times, or while fully forgetting to get some required items. All
in all, I was having the feeling that it can be done much more efficiently
if I only had the proper tools, but everyhting I could find was falling short.
So I've decided to make them myself.

I've settled on a tech stack that was popular at the moment (Python + 
Django, Javascript + Angular) and initially envisaged a cloud service that would
service many users. The backend was built on top of a MySQL DB and the web server
was Apache. The application was split into a REST based API service and a Web 
based SPA. Everything was hosted on a modest host, that had just enough
resources to get me started. It all went smooth for a while..

Fast forward to 2022. The world has changed and so did my shopping habits. 
We have been using the service and it proved to be helpful, above all
by making it easier to document our recipes and cooking experiences. Deciding
on the menu has become less of a struggle with the memory, and more a 
recollection of time spent together. The shopping list feature is something
that was less used. Partly due do changes in the store organization that had
me visiting mainly one store, and then Covid happened and we made the 
switch to online shopping for groceries as well. Picking-up the items from the
shelves is not my problem anymore :). Nevertheless, I liked the idea of that 
feature and I still believe it can be helpful to someone. Besides, it posed
some interesting usability challenges, and had me enjoy experimenting with
different approaches to tackle them.

As of 2022, I've got some new ideas on how I can improve the quality of 
living at our place. This brought me again to the conclusion I have to
build the tools myself. However, the modest host I'm still using cannot
take up on the additional challenge in the current setup, so modification
are needed. These have impact on **Recipcion** as well. Functionally, the service
is unchanged, yet it is not meant to serve a lot of users anymore. So,
I've gave up MySQL and Apache, and moved to Sqlite and Gunicorn. I've also
moved towards Docker to facilitate migration to other hosts if needed. 
Finally, I've merged the SPA and the REST based service into one repository
in GitHub and spent some time on imporving the documentation. This should
make it easier for others to pick it.

## Install

The recommended way to install the application is by making use of the
provided Docker image.

```shell script
docker pull lvoinea/recipicon:latest
```

The application requires a `Docker` volume to store:
* two input configuration files (i.e., `site.ini` and `server_config.py`);
* the application (sqlite3) database;
* error and access logs.

For a simple configuration one can create a local host folder for mounting
the required `Docker` volume (e.g., `local/`). This folder should have 
read and write access for the group with id `9999`. The recommended way to
achieve this is to create the group in the host (e.g., `dockerapp`) and add the user that will
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
> `Docker` image, and **NOT** to open the `local/` folder for general rw
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
    lvoinea/recipicon /storage/config/server_config.py recipicon.wsgi
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

Set-up environment variables
```shell script
export SITE_CONFIG=local/config/site.ini
export SITE_DB=local/db/db.sqlite3
export DJANGO_SECRET_KEY=1234
```

Set-up the database:
```shell script
. venv/bin/activate
python manage.py makemigrations api
python manage.py migrate
```

### Running

The recommended way to run the server during development is using the
Django development server.

First set-up de required environment veriables (i.e., if not already done that):

```shell script
export SITE_CONFIG=local/config/site.ini
export SITE_DB=local/db/db.sqlite3
export DJANGO_SECRET_KEY=1234
```

Then run de development server:

```shell script
DJANGO_DEBUG=1 python manage.py runserver
```
In this configuration the web interface will be available at:

```shell script
http://127.0.0.1:8000/app/
```

Alternativelly, one can run the Gunicorn server to mimic the production
environemnt:

```shell script
gunicorn -c ./local/config/server_config_local.py recipicon.wsgi
```

In this way the web interface will be available at the Gunicorn 
configured port (e.g., 5000 when using the config above):

```shell script
http://127.0.0.1:5000/app/
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