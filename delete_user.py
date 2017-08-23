import sys

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'recipicon.settings'

import django
django.setup()

from api.models import Recipe, RecipeIngredient, Ingredient, UserProfile
from django.contrib.auth.models import User


if __name__ == "__main__":
    username = sys.argv[1]

    user = User.objects.get(username=username)
    user.delete()
