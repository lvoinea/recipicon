import sys

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'recipicon.settings'

import django
django.setup()

from api.models import Recipe, RecipeIngredient, Ingredient
from django.contrib.auth.models import User

user = raw_input('User:')
email = raw_input('E-mail:')
password = raw_input('Password:')

#--- Create user
user = User.objects.create_user(user, email, password)
user.save()

#--- Create ingredients
coffee = Ingredient(name = 'coffee', user = user)
coffee.save()

sugar = Ingredient(name = 'sugar', user = user)
sugar.save()

milk = Ingredient(name = 'milk', user = user)
milk.save()

#--- Create recipe
cappuccino = Recipe(name = 'cappuccino', category = '', duration = 10, serves = 2, user = user)
cappuccino.description = 'Make an expresso. Make milk foam. Add foam to expresso. Add warm milk. Add sugar topping.'
cappuccino.save()

#--- Add ingredients to recipe
r_coffee = RecipeIngredient(unit = 'tl', quantity = '4', recipe = cappuccino, ingredient = coffee)
r_coffee.save()

r_sugar = RecipeIngredient(unit = 'tl', quantity = '2', recipe = cappuccino, ingredient = sugar)
r_sugar.save()

r_milk = RecipeIngredient(unit = 'ml', quantity = '150', recipe = cappuccino, ingredient = milk)
r_milk.save()