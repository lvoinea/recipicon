from .models import Recipe, Ingredient, RecipeIngredient, Shop, IngredientShop, ShoppingList, ShoppingItem, UserProfile
from rest_framework import serializers

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('id','name',)        

class RecipeSerializer(serializers.ModelSerializer):
    
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Recipe
        fields = ('id','name', 'category', 'duration', 'serves', 'description','user','in_shopping_list')

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer()
    
    class Meta:
        model = RecipeIngredient
        fields = ('id','ingredient','unit','quantity')
        
class FullRecipeSerializer(serializers.ModelSerializer):
    
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    
    class Meta:
        model = Recipe
        fields = ('id','name', 'category', 'duration', 'serves', 'description','recipe_ingredients','in_shopping_list')
        
class ShoppingItemSerializer(serializers.ModelSerializer):

    ingredient = IngredientSerializer(read_only=True)
    recipe = FullRecipeSerializer(read_only=True)

    class Meta:
        model = ShoppingItem
        fields = ('id', 'unit', 'quantity', 'ingredient', 'recipe')
        
class ShoppingListSerializer(serializers.ModelSerializer):

    items = ShoppingItemSerializer(many=True, read_only=True)

    class Meta:
        model = ShoppingList
        fields = ('id', 'name', 'date', 'items')
 
class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ('name',)
        
class LocationSerializer(serializers.ModelSerializer):

    shop = serializers.ReadOnlyField(source='shop.name')

    class Meta:
        model = IngredientShop
        fields = ('location','shop')
        
class IngredientLocationSerializer(serializers.ModelSerializer):

    locations = LocationSerializer(many=True, read_only=True)

    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'locations')
 
class UserProfileSerializer(serializers.ModelSerializer):

    user = serializers.ReadOnlyField(source='user.username')
    shop = ShopSerializer(read_only=True)
    shoppingList = serializers.ReadOnlyField(source='shoppingList.id')

    class Meta:
        model = UserProfile
        fields = ('user','shop','shoppingList')
        
