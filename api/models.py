from __future__ import unicode_literals

from django.db import models
from django.utils.encoding import python_2_unicode_compatible

@python_2_unicode_compatible 
class Recipe(models.Model):
    name = models.CharField(max_length=128)
    category = models.CharField(max_length=32)
    duration = models.IntegerField(default=30)
    serves = models.IntegerField(default=2)
    description = models.CharField(max_length=2048)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='recipes')
    
    def __str__(self):
        return self.name

@python_2_unicode_compatible         
class Ingredient(models.Model):
    name = models.CharField(max_length=32)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='ingredients')
    
    def __str__(self):
        return self.name

@python_2_unicode_compatible         
class Shop(models.Model):
    name = models.CharField(max_length=32)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='shops')
    
    def __str__(self):
        return self.name

@python_2_unicode_compatible         
class ShoppingList(models.Model):
    name = models.CharField(max_length = 64)
    date = models.DateField(auto_now_add = True)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='lists')
    
    def __str__(self):
        return self.name
        
class UserProfile(models.Model):
    #-- FK
    user = models.OneToOneField('auth.User', related_name='profile', on_delete = models.CASCADE)
    shop = models.ForeignKey('Shop', related_name='+', on_delete = models.SET_NULL, null = True)    
    shoppingList = models.ForeignKey('ShoppingList', related_name='+', on_delete = models.SET_NULL, null = True)

class RecipeIngredient(models.Model):
    unit = models.CharField(max_length=16)
    quantity = models.FloatField(default=0)
    #-- FK
    recipe =  models.ForeignKey('Recipe', related_name='recipe_ingredients', on_delete = models.CASCADE)
    ingredient = models.ForeignKey('Ingredient', on_delete = models.CASCADE)
    
class IngredientShop(models.Model):
    location = models.CharField(max_length=32)
    #-- FK
    ingredient = models.ForeignKey('Ingredient', on_delete = models.CASCADE)
    shop = models.ForeignKey('Shop', related_name='shop_ingredients', on_delete = models.CASCADE)

class ShoppingItem(models.Model):
    unit = models.CharField(max_length=16,default="")
    amount = models.FloatField(default=0)
    checked = models.BooleanField(default = False)
    #-- FK
    ingredient = models.ForeignKey('Ingredient', related_name='+', on_delete = models.CASCADE)
    shoppingList = models.ForeignKey('ShoppingList', related_name='items', on_delete = models.CASCADE)

    
    
   
