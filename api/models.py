from __future__ import unicode_literals

from django.db import models
from django.utils.encoding import python_2_unicode_compatible

class UserProfile(models.Model):
    created = models. DateTimeField(auto_now_add=True)
    #-- FK
    user = models.OneToOneField('auth.User', related_name='profile', on_delete = models.CASCADE)
    shop = models.ForeignKey('Shop', related_name='+', on_delete = models.SET_NULL, null = True)    
    shoppingList = models.ForeignKey('ShoppingList', related_name='+', on_delete = models.SET_NULL, null = True)

@python_2_unicode_compatible 
class Recipe(models.Model):
    name = models.CharField(max_length=128)
    category = models.CharField(max_length=32)
    duration = models.IntegerField(default=30)
    serves = models.IntegerField(default=2)
    description = models.CharField(max_length=2048)
    image = models.TextField(null = True)
    created = models. DateTimeField(auto_now_add=True)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='recipes', on_delete = models.CASCADE)
    
    def __str__(self):
        return self.name
        
    def in_shopping_list(self):
        pass
        
@python_2_unicode_compatible         
class Ingredient(models.Model):
    name = models.CharField(max_length=32)
    created = models. DateTimeField(auto_now_add=True)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='ingredients', on_delete = models.CASCADE)
    
    def __str__(self):
        return self.name
        
class RecipeIngredient(models.Model):
    unit = models.CharField(max_length=16)
    quantity = models.FloatField(default=0)
    #-- FK
    recipe =  models.ForeignKey('Recipe', related_name='recipe_ingredients', on_delete = models.CASCADE)
    ingredient = models.ForeignKey('Ingredient', related_name='recipe_ingredients', on_delete = models.CASCADE)

@python_2_unicode_compatible         
class ShoppingList(models.Model):
    name = models.CharField(max_length = 64)
    date = models.DateField(auto_now_add = True)
    created = models. DateTimeField(auto_now_add=True)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='lists', on_delete = models.CASCADE)
    
    def __str__(self):
        return self.name
        
class ShoppingItem(models.Model):
    unit = models.CharField(max_length=16,default="")   # unit for free items, 'serves' for recipe
    quantity = models.FloatField(default=0)             # number of units/serves
    #-- FK
    ingredient = models.ForeignKey('Ingredient', related_name='+', on_delete = models.CASCADE, null = True)
    recipe =  models.ForeignKey('Recipe', related_name='+', on_delete = models.CASCADE, null = True)
    shoppingList = models.ForeignKey('ShoppingList', related_name='items', on_delete = models.CASCADE)
        
@python_2_unicode_compatible         
class Shop(models.Model):
    name = models.CharField(max_length=32)
    created = models. DateTimeField(auto_now_add=True)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='shops', on_delete = models.CASCADE)
    
    def __str__(self):
        return self.name
        
@python_2_unicode_compatible         
class Location(models.Model):
    name = models.CharField(max_length=32)
    created = models. DateTimeField(auto_now_add=True)
    #-- FK
    user = models.ForeignKey('auth.User', related_name='locations', on_delete = models.CASCADE)
    shop = models.ForeignKey('Shop', related_name='locations', on_delete = models.CASCADE)
    
    def __str__(self):
        return self.name  
        
class IngredientLocation(models.Model):
    #-- FK
    ingredient = models.ForeignKey('Ingredient', related_name='locations', on_delete = models.CASCADE)
    location = models.ForeignKey('Location', related_name='ingredients', on_delete = models.CASCADE)



    
    
   
