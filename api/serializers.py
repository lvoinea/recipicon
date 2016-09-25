from .models import Recipe, Ingredient, RecipeIngredient, Shop, ShoppingList, UserProfile
from rest_framework import serializers

class RecipeSerializer(serializers.ModelSerializer):
    
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Recipe
        fields = ('id','name', 'category', 'duration', 'serves', 'description','user')

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient = serializers.ReadOnlyField(source='ingredient.name')
    
    class Meta:
        model = RecipeIngredient
        fields = ('id','ingredient','unit','quantity')
        
class FullRecipeSerializer(serializers.ModelSerializer):
    
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ('id','name', 'category', 'duration', 'serves', 'description','recipe_ingredients')
        
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('name',)
        
class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('name')
        
class ShoppingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingList
        fields = ('name','date')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('user','shop','shoppingList')