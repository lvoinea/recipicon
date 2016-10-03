from .models import Recipe, RecipeIngredient, Ingredient, ShoppingList, UserProfile
from .serializers import RecipeSerializer, FullRecipeSerializer, IngredientSerializer, ShoppingListSerializer
from .permissions import IsOwner
from .authentications import CsrfExemptTokenAuthentication

from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth import authenticate, login, logout

from django.shortcuts import get_object_or_404

from django.db.models import Model

from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework import status
 
#{"username":"jhon","password":"papa"} 

@api_view(['POST'])
@authentication_classes((CsrfExemptTokenAuthentication,))
@csrf_exempt
def LoginEp(request):
    """
    Authenticates a user
    """
    username = request.data['username']
    password = request.data['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            token = Token.objects.get_or_create(user=user)
            return Response(token[0].key, status=status.HTTP_200_OK)
        else:
            return Response('Account has been disabled', status=status.HTTP_403_FORBIDDEN)            
    else:
        return Response('Invalid login combination', status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['GET'])
def LogoutEp(request):
    """
    Logout a user
    """
    if request.user.is_authenticated():
        token = Token.objects.get_or_create(user=request.user)
        token[0].delete()
    logout(request)
    return Response('User logged out', status=status.HTTP_200_OK)
 
class RecipeListEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):    
        #return recipes
        user = self.request.user
        recipes = Recipe.objects.filter(user__username=user.username)
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)   
        
class RecipeEp(APIView):
    permission_classes = (IsAuthenticated, IsOwner,)
    
    def get(self, request, recipeId, format=None):    
        #return recipe together with ingredients?
        recipe = get_object_or_404(Recipe, pk=recipeId)
        self.check_object_permissions(self.request, recipe)
        serializer = FullRecipeSerializer(recipe)
        return Response(serializer.data)
        
    def delete(self, request, recipeId, format=None):
        recipe = get_object_or_404(Recipe, pk=recipeId)
        self.check_object_permissions(self.request, recipe)
        recipe.delete()
        return Response('')       
    
    def post(self, request, recipeId, format=None):
    
        user = self.request.user
        
        newRecipe = request.data;        
        if not Utils.isValidRecipe(newRecipe):
            return Response('Unkonwn recipe data', status=status.HTTP_400_BAD_REQUEST)        
        
        #------------------------------- Update recipe            
        # recipe exists
        if (newRecipe['id'] != '_'):                       
            oldRecipe = get_object_or_404(Recipe, pk=newRecipe['id'])
        # recipe is new
        else :
            oldRecipe = Recipe(user=user)
            oldRecipe.save()
        
        oldRecipe.name = newRecipe['name']
        oldRecipe.category = newRecipe['category']
        oldRecipe.description = newRecipe['description']
        oldRecipe.serves = newRecipe['serves']
        oldRecipe.duration = newRecipe['duration']
            
        #------------------------------- Update ingredients 
        #- Remove deleted ingredients
        newRecipeIngredients = set([])
        for newRecipeIngredient in newRecipe['recipe_ingredients']:          
            if not Utils.isValidIngredient(newRecipeIngredient):
                return Response('Unkonwn recipe ingredient data: '+ str(newRecipeIngredient), status=status.HTTP_400_BAD_REQUEST)
            else:
                newRecipeIngredient['id'] = str(newRecipeIngredient['id'])
                newRecipeIngredients.add(newRecipeIngredient['id'])
        #print newRecipeIngredients
        
        dOldRecipeIngredients = {}
        for oldRecipeIngredient in oldRecipe.recipe_ingredients.all():
            oldRecipeIngredientId = str(oldRecipeIngredient.id)
            if not oldRecipeIngredientId in newRecipeIngredients:
                oldRecipeIngredient.delete()
                #print 'delete recipe ingredient :'+ oldRecipeIngredientId
            else:
                dOldRecipeIngredients[oldRecipeIngredientId] = oldRecipeIngredient
        
        
        #- Add new ingredients
        for newRecipeIngredient in newRecipe['recipe_ingredients']:            
            if newRecipeIngredient['id'].startswith('_'):         
                oldRecipeIngredient = RecipeIngredient(recipe=oldRecipe)
            else:
                oldRecipeIngredient = dOldRecipeIngredients[str(newRecipeIngredient['id'])]
                      
            oldRecipeIngredient.unit = newRecipeIngredient['unit']
            oldRecipeIngredient.quantity = newRecipeIngredient['quantity'] 
            oldRecipeIngredient.ingredient = Utils.getSetIngredient(newRecipeIngredient['ingredient'], user)                       
            oldRecipeIngredient.save()
            
        #------------------------------- Save recipe  
        oldRecipe.save()
        serializer = FullRecipeSerializer(oldRecipe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
class IngredientsEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):    
        #return recipes
        user = self.request.user
        ingredients = Ingredient.objects.filter(user__username=user.username)
        serializer = IngredientSerializer(ingredients, many=True)
        return Response(serializer.data)
        
class ShoppingListEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, shoppingListId, format=None):
        if (shoppingListId == '_'):
            user = self.request.user
            userProfile = get_object_or_404(UserProfile,user__username=user.username)            
            shoppingList = userProfile.shoppingList
        else:
            shoppingList = get_object_or_404(ShoppingList, pk=shoppingListId)
            
        self.check_object_permissions(self.request, shoppingList)
        serializer = ShoppingListSerializer(shoppingList)
        return Response(serializer.data)
    
    def post(self, request, shoppingListId, format=None):    
    
        user = self.request.user
        
        newShoppingList = request.data;        
        if not Utils.isValidShoppingList(newShoppingList):
            return Response('Unkonwn shopping list data', status=status.HTTP_400_BAD_REQUEST)   
        
        #---------------------------- Update existing shopping list ---
        if (shoppingListId != '_'):                       
            shoppingList = get_object_or_404(ShoppingList, pk=shoppingListId)
            shoppingList.name = newShoppingList['name']
            
            #- Remove deleted items
            newShoppingItems = set([])
            for newItem in newShoppingList['items']:
                if not Utils.isValidShoppingItem(newItem):
                    return Response('Unkonwn shopping list item data: '+ str(newItem), status=status.HTTP_400_BAD_REQUEST)
                else:
                    newItem['id'] = str(newItem['id'])
                    newShoppingItems.add(newItem['id'])
            
            dOldShoppingItems = {}
            for oldShoppingItem in shoppingList.items.all():
                oldShoppingItemId = str(oldShoppingItem.id)
                if not oldShoppingItemId in newShoppingItems:
                    oldShoppingItem.delete()
                    #print 'delete shopping item :'+ oldShoppingItemId
                else:
                    dOldShoppingItems[oldShoppingItemId] = oldShoppingItem
        
            #- Add new items
            for newItem in newShoppingList['items']:           
                if newItem['id'].startswith('_'):         
                    shoppingItem = ShoppingItem(shoppingList = shoppingList)
                else:
                    shoppingItem = dOldShoppingItems[str(newItem['id'])]
                    
                shoppingItem.unit = newItem['unit']
                shoppingItem.quantity = newItem['quantity']                
                if (newItem['ingredient'] is not None):
                    shoppingItem.recipe = None;
                    shoppingItem.ingredient = Utils.getSetIngredient(newItem['ingredient'], user)
                elif (newItem['recipe'] is not None):
                    shoppingItem.ingredient = None
                    shoppingItem.recipe = get_object_or_404(Recipe, pk=newItem['recipe']['id'])
                shoppingItem.save()
            
        #--------------------------------- Create new shopping list ---
        else :
            shoppingList = ShoppingList(user=user)  
            shoppingList.save()
            
            # Make this the current shopping list in the user profile
            userProfile = get_object_or_404(UserProfile,user__username=user.username)
            userProfile.shoppingList = shoppingList
            userProfile.save()   
            
            # Clone all items (if any)
            for newItem in newShoppingList['items']:
                shoppingItem = ShoppingItem(unit = newItem['unit'], quantity = newItem['quantity'], shoppingList = shoppingList)
                if (newItem['ingredient'] is not None):
                    shoppingItem.recipe = None;
                    shoppingItem.ingredient = Utils.getSetIngredient(newItem['ingredient'], user)
                elif (newItem['recipe'] is not None):
                    shoppingItem.ingredient = None
                    shoppingItem.recipe = get_object_or_404(Recipe, pk=newItem['recipe']['id'])
                shoppingItem.save()
                shoppingList.items.add(shoppingItem)         
               
        
        shoppingList.save()
        serializer = ShoppingListSerializer(shoppingList)
        return Response(serializer.data)  
        
class Utils():

    @staticmethod
    def isValidIngredient(ingredient):
        return set(ingredient.keys()).issubset(set(['id', 'ingredient', 'unit', 'quantity']))
    
    @staticmethod
    def isValidRecipe(recipe):
        return set(recipe.keys()).issubset(set(['id', 'name', 'category', 'description', 'serves', 'duration', 'recipe_ingredients']))
     
    @staticmethod
    def isValidShoppingList(shoppingList):
        return set(shoppingList.keys()).issubset(set(['id','name','items']))
     
    @staticmethod
    def isValidShoppingItem(shoppingItem):
        return set(shoppingItem.keys()).issubset(set(['id', 'unit', 'quantity', 'ingredient', 'recipe']))
     
    @staticmethod
    def getSetIngredient(name, user):
        try:
             ingredient = Ingredient.objects.get(name=newRecipeIngredient['ingredient'], user=user)
             #print 'old ingredient :'+ingredient.name
        except Ingredient.DoesNotExist:
             ingredient = Ingredient(name=newRecipeIngredient['ingredient'], user=user)                 
             #print 'new ingredient :'+ingredient.name
             ingredient.save()
        return ingredient