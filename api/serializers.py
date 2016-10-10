from .models import Recipe, Ingredient, RecipeIngredient, Shop, ShoppingList, ShoppingItem, UserProfile
from rest_framework import serializers

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('name',)

class RecipeSerializer(serializers.ModelSerializer):
    
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Recipe
        fields = ('id','name', 'category', 'duration', 'serves', 'description','user','in_shopping_list')

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient = serializers.ReadOnlyField(source='ingredient.name')
    
    class Meta:
        model = RecipeIngredient
        fields = ('id','ingredient','unit','quantity')
        
class FullRecipeSerializer(serializers.ModelSerializer):
    
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    
    class Meta:
        model = Recipe
        fields = ('id','name', 'category', 'duration', 'serves', 'description','recipe_ingredients','in_shopping_list')
        
class ShoppingItemSerializer(serializers.ModelSerializer):

    ingredient = serializers.ReadOnlyField(source='ingredient.name')
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
        model = Ingredient
        fields = ('name')
 
class UserProfileSerializer(serializers.ModelSerializer):

    user = serializers.ReadOnlyField(source='user.username')
    shop = ShopSerializer(read_only=True)
    shoppingList = serializers.ReadOnlyField(source='shoppingList.id')

    class Meta:
        model = UserProfile
        fields = ('user','shop','shoppingList')
        
