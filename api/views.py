from .models import Recipe, RecipeIngredient, Ingredient, ShoppingList, ShoppingItem, UserProfile, IngredientLocation, Shop, Location
from .serializers import ShortRecipeSerializer, RecipeSerializer, FullRecipeSerializer, IngredientSerializer, ShoppingListSerializer, IngredientLocationSerializer, ShopSerializer, LocationSerializer
from .permissions import IsOwner
from .authentications import CsrfExemptTokenAuthentication, CsrfExemptSessionAuthentication
from .utils import Utils

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
from rest_framework.authentication import BasicAuthentication
from rest_framework.renderers import JSONRenderer
from django.http import JsonResponse
 
#{"username":"jhon","password":"papa"} 

@api_view(['POST'])
@csrf_exempt
@authentication_classes((CsrfExemptTokenAuthentication, CsrfExemptSessionAuthentication, BasicAuthentication))
def LoginEp(request):
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

@api_view(['POST'])
@csrf_exempt
@authentication_classes((CsrfExemptTokenAuthentication, CsrfExemptSessionAuthentication, BasicAuthentication))
def SignUpEp(request):
    username = request.data['username']
    email = request.data['email']
    password = request.data['password']
    confirmPassword = request.data['confirmPassword']

    if (password != confirmPassword):
        return Response('the two password are not identical', status=status.HTTP_400_BAD_REQUEST)
    if UserProfile.objects.filter(user__username=username).exists():
        return Response('the provided email is already in use', status=status.HTTP_400_BAD_REQUEST)

    Utils.createUser(username, email, password)
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
    if request.user.is_authenticated():
        token = Token.objects.get_or_create(user=request.user)
        token[0].delete()
    logout(request)
    return Response('User logged out', status=status.HTTP_200_OK)

@api_view(['GET'])
def CloseUpEp(request):
    user = request.user
    if request.user.is_authenticated():
        token = Token.objects.get_or_create(user=request.user)
        token[0].delete()
    logout(request)
    user.delete()

    return Response('User account closed', status=status.HTTP_200_OK)

@api_view(['GET'])
def ResetEp(request,email,token):
    print email, token
    #TODO: this will send the email
    #TODO: POST will reset the password if the token mathes the user
    return Response('OK', status=status.HTTP_200_OK)

class RecipeListEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):    
        user = self.request.user
        recipes = user.recipes.all()
        recipeIds = [recipe.id for recipe in recipes]
        
        # Recipes have to be marked to indicate whether they are included in the current shopping ist or not
        # To this end, the shooping liist is retrieved first from the user profile
        # Then the set of recipe ids in the current shopping list is computed.
        # Based n this set the previously retrieved recipes are marked appropriately.

        userProfile = get_object_or_404(UserProfile,user__username=user.username)
        shoppingList = userProfile.shoppingList
        items = shoppingList.items.filter(recipe_id__in = recipeIds)
        selectedRecipeIds = set([item.recipe.id for item in items])

        for recipe in recipes:
            if recipe.id in selectedRecipeIds:
                recipe.in_shopping_list = True
            else:
                recipe.in_shopping_list = False
        
        serializer = ShortRecipeSerializer(recipes, many=True)
        return Response(serializer.data)   
        
class RecipeEp(APIView):
    permission_classes = (IsAuthenticated, IsOwner,)
    
    #return recipe together with ingredients and presence in the shopping list
    def get(self, request, recipeId, format=None):    
        
        recipe = get_object_or_404(Recipe, pk=recipeId)
        self.check_object_permissions(self.request, recipe)
        
        # Check if the recipe is in the current shopping list
        # The current shopping list has to be retrieved first from the user profile.
        recipe.in_shopping_list = False        
        user = self.request.user
        userProfile = get_object_or_404(UserProfile,user__username=user.username)            
        shoppingList = userProfile.shoppingList
        items = shoppingList.items.filter(recipe_id = recipeId)
        if (len(items) == 1):
            recipe.in_shopping_list = True       
        
        serializer = FullRecipeSerializer(recipe)
        return Response(serializer.data)
        
    def delete(self, request, recipeId, format=None):
        recipe = get_object_or_404(Recipe, pk=recipeId)
        self.check_object_permissions(self.request, recipe)

        recipe.delete()

        return Response(status.HTTP_204_NO_CONTENT)       
    
    def post(self, request, recipeId, format=None):
    
        user = self.request.user
        
        # Check first if the recipe has a valid object format
        newRecipe = request.data;
        if not ViewUtils.isValidRecipe(newRecipe):
            return Response('Unknown recipe data', status=status.HTTP_400_BAD_REQUEST)
        
        #------------------------------- Update recipe            
        # recipe exists
        if (newRecipe['id'] != '_'):                       
            oldRecipe = get_object_or_404(Recipe, pk=newRecipe['id'])
            self.check_object_permissions(self.request, oldRecipe)
        # recipe is new
        else :
            oldRecipe = Recipe(user=user)
            oldRecipe.save()
        
        oldRecipe.name = newRecipe['name']
        oldRecipe.category = newRecipe['category']
        oldRecipe.description = newRecipe['description']
        oldRecipe.serves = newRecipe['serves']
        oldRecipe.duration = newRecipe['duration']
        oldRecipe.image = newRecipe['image']
            
        #------------------------------- Update ingredients 
        #- Remove deleted recipe ingredient relations
        newRecipeIngredientIds = set([])
        for newRecipeIngredient in newRecipe['recipe_ingredients']:          
            if not ViewUtils.isValidRecipeIngredient(newRecipeIngredient):
                return Response('Unknown recipe ingredient data: '+ str(newRecipeIngredient), status=status.HTTP_400_BAD_REQUEST)
            else:
                newRecipeIngredient['id'] = str(newRecipeIngredient['id'])
                newRecipeIngredientIds.add(newRecipeIngredient['id'])
        #print newRecipeIngredientIds
        
        dOldRecipeIngredients = {}
        for oldRecipeIngredient in oldRecipe.recipe_ingredients.all():
            oldRecipeIngredientId = str(oldRecipeIngredient.id)
            if not oldRecipeIngredientId in newRecipeIngredientIds:
                oldRecipeIngredient.delete()
            else:
                dOldRecipeIngredients[oldRecipeIngredientId] = oldRecipeIngredient
        
        
        #- Add new recipe ingredient relations
        for newRecipeIngredient in newRecipe['recipe_ingredients']:            
            if newRecipeIngredient['id'].startswith('_'):         
                oldRecipeIngredient = RecipeIngredient(recipe=oldRecipe)
            else:
                oldRecipeIngredient = dOldRecipeIngredients[str(newRecipeIngredient['id'])]
                      
            oldRecipeIngredient.unit = newRecipeIngredient['unit']
            oldRecipeIngredient.quantity = newRecipeIngredient['quantity'] 
            oldRecipeIngredient.ingredient = Ingredient.objects.get(id=newRecipeIngredient['ingredient'], user=user)
            oldRecipeIngredient.save()
            
        #------------------------------- Save recipe  
        oldRecipe.save()
        
        # Check if the recipe is in the current shopping list
        # To this end, retrieve first the shopping list from the user profile
        oldRecipe.in_shopping_list = False        
        userProfile = get_object_or_404(UserProfile,user__username=user.username)            
        shoppingList = userProfile.shoppingList
        items = shoppingList.items.filter(recipe_id = oldRecipe.id)
        if (len(items) == 1):
            oldRecipe.in_shopping_list = True

        serializer = FullRecipeSerializer(oldRecipe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
class IngredientListEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):    
        user = self.request.user
        ingredients = user.ingredients

        serializer = IngredientLocationSerializer(ingredients, many=True)
        return Response(serializer.data)
        
class IngredientEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, ingredientId, format=None):    
        
        ingredient = get_object_or_404(Ingredient, pk=ingredientId)
        self.check_object_permissions(self.request, ingredient)
        
        serializer = IngredientLocationSerializer(ingredient)
        return Response(serializer.data)
        
    def post(self, request, ingredientId, format=None):    
        
        user = self.request.user

        # Check first if the ingredient has a valid object format
        newIngredient = request.data
        if not ViewUtils.isValidIngredient(newIngredient):
            return Response('Unknown ingredient data', status=status.HTTP_400_BAD_REQUEST)
        
        if (str(newIngredient['id']).startswith('_')):
            ingredient = Ingredient(user=user)
            ingredient.save()
        else:
            ingredient = Ingredient.objects.get(id=newIngredient['id'])
            self.check_object_permissions(self.request, ingredient)
            
        ingredient.name = newIngredient['name']

        locations = Location.objects.filter(id__in = newIngredient['locations']) 
        newLocationIds = [location.id for location in locations]
        ingredientLocations = IngredientLocation.objects.filter(ingredient__id= ingredientId)
        oldLocationIds = [ingredientLocation.location.id for ingredientLocation in ingredientLocations]

        newIngredientLocations = []
        # delete removed locations
        for ingredientLocation in ingredientLocations:
            if not (ingredientLocation.location.id in newLocationIds):
                ingredientLocation.delete()
            else:
                newIngredientLocations.append(ingredientLocation)
        # add new locations
        for location in locations:
            if not (location.id in oldLocationIds):
                ingredientLocation = IngredientLocation(location = location, ingredient = ingredient)
                ingredientLocation.save()
                newIngredientLocations.append(ingredientLocation)

        ingredient.locations.set(newIngredientLocations)
        ingredient.save()
   
        serializer = IngredientLocationSerializer(ingredient)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
class IngredientByNameEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, ingredientName, format=None):
        
        user = self.request.user
        ingredient = get_object_or_404(Ingredient, name=ingredientName, user__username=user.username)
        self.check_object_permissions(self.request, ingredient)
        
        serializer = IngredientLocationSerializer(ingredient)
        return Response(serializer.data)

    def put(self, request, ingredientName, format=None):
        
        user = self.request.user
        ingredient = Ingredient(user=user, name=ingredientName)
        ingredient.save()

        serializer = IngredientLocationSerializer(ingredient)
        return Response(serializer.data)

class ShoppingListEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    # Use id = '_' to get the current shopping list from the user profile
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
    
    # Use id = '_' to create a new shopping list and register it in the user profile 
    def post(self, request, shoppingListId, format=None):    
        user = self.request.user
        
        # Check first if the shopping list has a valid object format
        newShoppingList = request.data;
        if not ViewUtils.isValidShoppingList(newShoppingList):
            return Response('Unkonwn shopping list data', status=status.HTTP_400_BAD_REQUEST)   
        
        #---------------------------- Update existing shopping list ---
        if (shoppingListId != '_'):                       
            shoppingList = get_object_or_404(ShoppingList, pk=shoppingListId)
            self.check_object_permissions(self.request, shoppingList)

            shoppingList.name = newShoppingList['name']
            
            #- Remove deleted items
            newShoppingItems = set([])
            for newItem in newShoppingList['items']:
                if not ViewUtils.isValidShoppingItem(newItem):
                    return Response('Unkonwn shopping list item data: '+ str(newItem), status=status.HTTP_400_BAD_REQUEST)
                else:
                    newItem['id'] = str(newItem['id'])
                    newShoppingItems.add(newItem['id'])
            
            dOldShoppingItems = {}
            for oldShoppingItem in shoppingList.items.all():
                oldShoppingItemId = str(oldShoppingItem.id)
                if not oldShoppingItemId in newShoppingItems:
                    oldShoppingItem.delete()
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
                # ingredient items are created if they do not exist already
                if (newItem['ingredient'] is not None):
                    shoppingItem.recipe = None
                    shoppingItem.ingredient = Ingredient.objects.get(pk=newItem['ingredient'], user=user)
                # recipe items have to exist already or an error will be raised
                # 10.10.2016: this assumes shoppping lists can be edited by adding recipes - currently not used
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
            
            # Clone all items (if any) - can be used to create a new shopping list starting from an old one
            for newItem in newShoppingList['items']:
                shoppingItem = ShoppingItem(unit = newItem['unit'], quantity = newItem['quantity'], shoppingList = shoppingList)
                # ingredient items are created if they do not exist already
                if (newItem['ingredient'] is not None):
                    shoppingItem.recipe = None
                    shoppingItem.ingredient = Ingredient.objects.get(pk=newItem['ingredient'], user=user)
                # recipe items have to exist already or an error will be raised
                elif (newItem['recipe'] is not None):
                    shoppingItem.ingredient = None
                    shoppingItem.recipe = get_object_or_404(Recipe, pk=newItem['recipe']['id'])
                shoppingItem.save()
                shoppingList.items.add(shoppingItem)         
               
        
        shoppingList.save()
        serializer = ShoppingListSerializer(shoppingList)
        return Response(serializer.data)  
        
class ShoppingRecipeItemEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)

    # use shoppingListId = '_' to search for recipe in the current shopping list
    def get(self, request, shoppingListId, recipeId, format=None):
        
        result = False
        user = self.request.user
        
        # get shopping list
        if (shoppingListId == '_'):  
            userProfile = get_object_or_404(UserProfile,user__username=user.username)            
            shoppingList = userProfile.shoppingList
        else:
            shoppingList = get_object_or_404(ShoppingList, pk=shoppingListId)
            self.check_object_permissions(self.request, shoppingList)
            
        # find item
        items = shoppingList.items.filter(recipe_id = recipeId)
        if (len(items) == 1):
            result = True
            
        return Response(result)
        
    def post(self, request, shoppingListId, recipeId, format=None):
        command = request.data        
        
        # Check first if the shopping item has a valid object format
        if not ViewUtils.isValidShoppingItemCmd(command):
            return Response('Unknown command format.', status=status.HTTP_400_BAD_REQUEST)
        
        # get shopping list
        user = self.request.user
        if (shoppingListId == '_'):  
            userProfile = get_object_or_404(UserProfile,user__username=user.username)            
            shoppingList = userProfile.shoppingList
        else:
            shoppingList = get_object_or_404(ShoppingList, pk=shoppingListId)
            self.check_object_permissions(self.request, shoppingList)
        
        # find shopping item
        shoppingItem = None
        items = shoppingList.items.filter(recipe_id = recipeId)
        if (len(items) == 1):
            shoppingItem = items[0]
        
        response = None
        if (command['action'] == 'add'):
            if shoppingItem is not None:
                response = 'already in list'
            else:
                shoppingItem = ShoppingItem(shoppingList = shoppingList)
                shoppingItem.ingredient = None
                shoppingItem.recipe = get_object_or_404(Recipe, pk=recipeId)
                shoppingItem.unit = 'serve'
                shoppingItem.quantity = shoppingItem.recipe.serves
                shoppingItem.save()
                response = 'added'
        elif (command['action'] == 'remove'):
            if shoppingItem is None:
                response = 'not in list'                
            else:
                shoppingItem.delete()
                response = 'removed'
        else:
            return Response('Unkonwn command: '+ str(command['action']), status=status.HTTP_400_BAD_REQUEST)
        
        return Response(response) 

class ShopListEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):
        user = self.request.user
        shops = user.shops

        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)

class ShopEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, shopId, format=None):
    
        if (shopId == '_'):
            user = self.request.user
            userProfile = get_object_or_404(UserProfile,user__username=user.username)            
            shop = userProfile.shop
        else:
            shop = get_object_or_404(Shop, pk=shopId)
            self.check_object_permissions(self.request, shop)
            
        serializer = ShopSerializer(shop)
        return Response(serializer.data)
        
    def post(self, request, shopId, format=None):
    
        user = self.request.user        
        newShop = request.data
        
        if (str(newShop['id']).startswith('_')):
            shop = Shop(user=user)
            shop.save()            
        else:
            shop = get_object_or_404(Shop, pk=newShop['id'])
            self.check_object_permissions(self.request, shop)
            
        shop.name = newShop['name']
        shop.save()
        
        serializer = ShopSerializer(shop)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, shopId, format=None):
        
        try:
            val = int(shopId)
        except ValueError:
            return Response('Unkonwn shop', status=status.HTTP_400_BAD_REQUEST)    
        
        shop = get_object_or_404(Shop, pk=shopId)
        self.check_object_permissions(self.request, shop)

        shop.delete()

        return Response(status.HTTP_204_NO_CONTENT)

class CurrentShopEp(APIView):

    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):
    
        user = self.request.user
        userProfile = get_object_or_404(UserProfile,user__username=user.username)
        shop = userProfile.shop
            
        serializer = ShopSerializer(shop)
        return Response(serializer.data)
        
    def post(self, request, format=None):
    
        user = self.request.user        
        newCurrentShop = request.data
        
        userProfile = get_object_or_404(UserProfile,user__username=user.username)
        shop = None
        if (newCurrentShop['id'] is not None):
            shop = get_object_or_404(Shop, pk=newCurrentShop['id'])
            self.check_object_permissions(self.request, shop)

        userProfile.shop = shop
        userProfile.save()
            
        serializer = ShopSerializer(shop)
        return Response(serializer.data)
        
class LocationListEp(APIView):

    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):
        user = self.request.user
        locations = user.locations

        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)
        
class LocationEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, locationId, format=None):
    
        try:
            val = int(locationId)
        except ValueError:
            return Response('Unknown location', status=status.HTTP_400_BAD_REQUEST)
        
        location = get_object_or_404(Location, pk=locationId)
        self.check_object_permissions(request, location)
            
        serializer = LocationSerializer(location)
        return Response(serializer.data)
        
    def post(self, request, locationId, format=None):
    
        user = self.request.user        
        newLocation = request.data
        
        shop = get_object_or_404(Shop,pk=newLocation['shop'])
        self.check_object_permissions(request, shop)
        
        if (locationId.startswith('_')):
            location = Location(user=user, shop=shop)
            location.save()            
        else:
            location = get_object_or_404(Location, pk=locationId)
            self.check_object_permissions(request, location)
            location.shop = shop        
        
        location.name = newLocation['name']
        location.save()
        
        serializer = LocationSerializer(location)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def delete(self, request, locationId, format=None):
        
        try:
            val = int(locationId)
        except ValueError:
            return Response('Unknown location', status=status.HTTP_400_BAD_REQUEST)
    
        location = get_object_or_404(Location, pk=locationId)
        self.check_object_permissions(self.request, location)

        location.delete()
        return Response(status.HTTP_204_NO_CONTENT)  

class StatsEp(APIView):
    permission_classes = (IsAuthenticated,IsOwner)
    
    def get(self, request, format=None):
        user = self.request.user
        
        stats = {}

        #--- Recipes
        statsRecipes = []
        _stats = {}

        recipes = Recipe.objects.filter(user__username=user.username)
        for recipe in recipes:
            category = recipe.category            
            if (category == ''):
                category = "other"
            if category in _stats:
                _stats[category] += 1
            else:
                _stats[category] = 1
        for k in _stats:
            statsRecipes.append({'category':k, 'recipes':_stats[k]})        

        #--- Ingredients
        statsIngredients = []
        _stats = {}

        ingredients = Ingredient.objects.filter(user__username=user.username)
        for ingredient in ingredients:
           _stats[ingredient.name] = len(ingredient.recipe_ingredients.all())
        for k in _stats:
            statsIngredients.append({'ingredient':k, 'recipes':_stats[k]})
        #---
        stats['recipes'] = statsRecipes
        stats['recipe_number'] = len(recipes)
        stats['ingredients'] = statsIngredients
        stats['ingredient_number'] = len(ingredients)
        return JsonResponse(stats)
        
class ViewUtils():

    @staticmethod
    def isValidRecipeIngredient(ingredient):
        return set(ingredient.keys()).issubset(set(['id', 'ingredient', 'unit', 'quantity']))
    
    @staticmethod
    def isValidIngredient(ingredient):
        return set(ingredient.keys()).issubset(set(['id', 'name', 'locations']))
    
    
    @staticmethod
    def isValidRecipe(recipe):
        return set(recipe.keys()).issubset(set(['id', 'name', 'category', 'description', 'serves', 'duration', 'recipe_ingredients','in_shopping_list','image']))
     
    @staticmethod
    def isValidShoppingList(shoppingList):
        return set(shoppingList.keys()).issubset(set(['id', 'name', 'date', 'items']))
     
    @staticmethod
    def isValidShoppingItem(shoppingItem):
        return set(shoppingItem.keys()).issubset(set(['id', 'unit', 'quantity', 'ingredient', 'recipe']))

    @staticmethod
    def isValidShoppingItemCmd(shoppingItem):
        return set(shoppingItem.keys()).issubset(set(['action']))
     
