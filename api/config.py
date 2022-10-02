import configparser, os

class SiteConfig:

    def __init__(self):
        self.config = configparser.ConfigParser()
        config_file=os.environ.get('SITE_CONFIG')
        self.config.read([config_file])
