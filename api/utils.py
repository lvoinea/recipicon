from .models import Recipe, RecipeIngredient, Ingredient, UserProfile, ShoppingList, Shop
from django.contrib.auth.models import User


class Utils(object):

    @staticmethod
    def createUser(username, email, password):
        user = User.objects.create_user(username, email, password)
        user.save()

        #--- Create Ingredients
        coffee = Ingredient(name='coffee', user=user)
        coffee.save()

        sugar = Ingredient(name='sugar', user=user)
        sugar.save()

        milk = Ingredient(name='milk', user=user)
        milk.save()

        #--- Create Recipe
        cappuccino = Recipe(name='cappuccino', category='', duration=10, serves=2, user=user)
        cappuccino.description = 'Make an expresso. Make milk foam. Add foam to expresso. Add warm milk. Add sugar topping.'
        cappuccino.save()

        #--- Add ingredients to recipe
        r_coffee = RecipeIngredient(unit='tl', quantity='4', recipe=cappuccino, ingredient=coffee)
        r_coffee.save()

        r_sugar = RecipeIngredient(unit='tl', quantity='2', recipe=cappuccino, ingredient=sugar)
        r_sugar.save()

        r_milk = RecipeIngredient(unit='ml', quantity='150', recipe=cappuccino, ingredient=milk)
        r_milk.save()

        #--- Create ShoppingList
        shoppingList = ShoppingList(user=user)
        shoppingList.save()

        #--- Create Shop
        shop = Shop(user=user)
        shop.name = 'My shop'
        shop.save()

        # --- Create UserProfile
        userProfile = UserProfile(user=user, shoppingList=shoppingList, shop=shop)
        userProfile.save()

    @staticmethod
    def deleteUser(username):
        user = User.objects.get(username = username)
        user.delete()

