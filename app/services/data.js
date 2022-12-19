(function() {
    'use strict';
    
    angular
        .module('app')
        .factory('DataService', DataService);

    DataService.$inject = ['$http', '$log', '$q','$rootScope'];

    function DataService($http, $log, $q, $rootScope) {
        return {
            initialize : initialize,
            //-- Recipe
            Recipe : Recipe,
            getRecipes: getRecipes,
            getRecipe: getRecipe,
            setRecipe: setRecipe,
            deleteRecipe: deleteRecipe,
            //-- Ingredient
            RecipeIngredient : RecipeIngredient,
            Item : Item,
            getIngredients : getIngredients,
            setIngredient : setIngredient,
            getIngredient : getIngredient,
            //-- Shop
            Shop : Shop,
            getShops : getShops,
            getCurrentShop : getCurrentShop,
            setCurrentShop : setCurrentShop,
            setShop : setShop,
            deleteShop : deleteShop,
            //-- Location
            Location : Location,
            getLocations : getLocations,
            setLocation : setLocation,
            deleteLocation : deleteLocation,
            //-- Shopping list
            getShoppingList : getShoppingList,
            setShoppingList : setShoppingList,
            addShoppingListRecipe : addShoppingListRecipe,
            removeShoppingListRecipe : removeShoppingListRecipe,
            getCheckedItems : getCheckedItems,
            //-- Statistics
            getStats : getStats
        };

        //---------------------------------------------- Design patterns
        // Objects are created outside the service and passed to the service
        // Service caches the objects it receives and passes references to it
        
        //---------------------------------------------- Init
        function initialize(){
            $rootScope.recipes = null;          // The list of known recipes
            $rootScope.recipe = null;           // Currently selected entitites
            $rootScope.ingredients = null;      // List of user known ingredients (id,name, [locationId])
            $rootScope.shoppingList = null;     // Currently selected shopping list
            $rootScope.shops = null;            // List of user known shops (id, name)
            $rootScope.currentShop = null;      // Currently selected shops
            $rootScope.locations = null;        // List of locations (id, name, shopId)
            $rootScope.checkedItems = null;     // List of checked items
        }
        
        //---------------------------------------------- Recipe
        function Recipe(){
            return {
                'id' : '_',
                'name' : '',
                'category' : '',
                'description' : '',
                'serves' : 2,
                'duration' : 30,
                'recipe_ingredients' : [],
                'in_shopping_list' : false,
                'image': null
            }
        }
        
        function getRecipes() {
            var deferred;
            
            if ($rootScope.recipes == null) {
                deferred = $http.get($rootScope.service+'/recipes')
                .then(function(response) {
                    $rootScope.recipes = {};
                    _.forEach(response.data, function(recipe){
                        $rootScope.recipes[recipe.id] = recipe
                    });
                    return $rootScope.recipes;
                });             
            } else {                
                deferred = $q.when($rootScope.recipes);
            }            
            return deferred;
        }        
       
        function getRecipe(id) {
            var deferred;
           
            if (!id) {
                $rootScope.recipe = Recipe();
                deferred = $q.when($rootScope.recipe);
            }
            else if (($rootScope.recipe == null) || ($rootScope.recipe.id != id)) {
                deferred= $http
                    .get($rootScope.service+'/recipe/'+id)
                    .then(function(response){
                        $rootScope.recipe = response.data;
                        //$rootScope.recipe.id = id;
                        return $rootScope.recipe;
                    });                
            } 
            else {               
                deferred = $q.when($rootScope.recipe);       
            }            
          
            return deferred;
        }
        
        function setRecipe(recipe) {
            var deferred;
            deferred = $http.post($rootScope.service+'/recipe/'+recipe.id, recipe)
            .then(function(response){
                $rootScope.recipe = response.data;
                $rootScope.recipes[$rootScope.recipe.id] = $rootScope.recipe;              
                return $rootScope.recipe;
            });
            return deferred;
        }
        
        function deleteRecipe(id){
            var deferred;
            deferred = $http.delete($rootScope.service+'/recipe/'+id)
            .then(function(response) {
                if (_.has($rootScope.recipes, id)){
                    delete $rootScope.recipes[id];
                }
            });
            return deferred;
        }
        
        //----------------------------------------------  Ingredient
        function Item(itemId, ingredientId, quantity, unit){
            return  {
                'id': '_'+ itemId,
                'ingredient' : ingredientId,
                'quantity' : quantity,
                'unit' : unit,
                'recipe' : null
            }
        }

        function RecipeIngredient(itemId, ingredientId, quantity, unit){
            return  {
                'id': itemId,
                'ingredient' : ingredientId,
                'quantity' : quantity,
                'unit' : unit 
            }
        }
        
        function getIngredients(){
            var deferred;
            
            if ($rootScope.ingredients == null) {
                deferred = $http.get($rootScope.service+'/ingredients')
                .then(function(response) {
                    $rootScope.ingredients = {};
                    _.forEach(response.data, function(ingredient){
                        $rootScope.ingredients[ingredient.id] = ingredient;
                    });
                    return $rootScope.ingredients;
                });     
            } else {                
                deferred = $q.when($rootScope.ingredients);                              
            }            
            return deferred; 
        }
        
        function setIngredient(ingredient){
            var deferred;
            deferred = $http.post($rootScope.service+'/ingredient/'+ingredient.id, ingredient)
            .then(function(response) {
                return response.data;
            });
            return deferred;
        }

        function getIngredient(ingredientName){
            var deferred;
            
            var ingredient = _.find(_.values($rootScope.ingredients),function(o){
                return o.name == ingredientName});

            if (ingredient == null) {
                deferred = $http.put($rootScope.service+'/ingredientbyname/'+ingredientName)
                .then(function(response) {
                    ingredient = response.data;
                    $rootScope.ingredients[ingredient.id] = ingredient;
                    return ingredient;
                });     
            } else {                
                deferred = $q.when(ingredient);                              
            }            
            return deferred; 
        }
        
        //---------------------------------------------- Shop
        function Shop(name){
            return {
                'id' : '_',
                'name' : name,
            }
        }

        function getShops(){
            var deferred;
            
            if ($rootScope.shops == null){
                deferred = $http.get($rootScope.service+'/shops')
                .then(function(response) {
                    $rootScope.shops = {};
                    _.forEach(response.data, function(shop){
                        $rootScope.shops[shop.id] = shop            
                    });
                    return $rootScope.shops;
                });            
            } else {                
                deferred = $q.when($rootScope.shops);                              
            }            
            return deferred;            
        }
        
        function getCurrentShop(){
            var deferred;
            
            if ($rootScope.currentShop == null){
                deferred = $http.get($rootScope.service+'/shop/current')
                .then(function(response) {
                    $rootScope.currentShop = response.data;
                    return $rootScope.currentShop;
                });            
            } else {                
                deferred = $q.when($rootScope.currentShop);                              
            }            
            return deferred;
        }
        
        function setCurrentShop(id){
            var deferred;
            deferred = $http.post($rootScope.service+'/shop/current', {'id':id})
            .then(function(response){
                $rootScope.currentShop = response.data;
                return $rootScope.currentShop;
            });
            return deferred;
        }

        function setShop(shop){
            var deferred;
            deferred = $http.post($rootScope.service+'/shop/'+shop.id, shop)
            .then(function(response){                
                var newShop = response.data
                if (shop.id == '_'){
                    // New shop added
                    $rootScope.shops[newShop.id] = newShop;
                }
                return newShop;
            });
            return deferred;
        }

        function deleteShop(shopId){
            var deferred;
            deferred = $http.delete($rootScope.service+'/shop/'+shopId)
            .then(function(response){

                // Remove shp from cache
                if (_.has($rootScope.shops, shopId)){
                    delete $rootScope.shops[shopId];
                } 

                //Remove all locations referring the shop
                _.forEach(_.keys($rootScope.locations), function(locationId){
                    if ($rootScope.locations[locationId].shopId == shopId){
                        delete $rootScope.locations[locationId];
                    }
                });

                //Remove all references to location frrom ingredients
                _.forEach(_.keys($rootScope.ingredients), function(ingredientId){
                   var ingredient = $rootScope.ingredients[ingredientId];
                   ingredient.locations = _.filter(ingredient.locations, function(locationId){
                       return _.has( $rootScope.locations, locationId);
                   })
                });

                //Remove current shop is same as deleted
                if ($rootScope.currentShop.id == shopId){
                    $rootScope.currentShop = null;
                }

                return $rootScope.shops;
            });
            return deferred;
        }
        
        //---------------------------------------------- Location
        
        function Location(name){
            return {
                'id' : '_',
                'name' : name,
                'shop' : $rootScope.currentShop.id
            }
        }
        
        function getLocations(){
            var deferred;
            
            if ($rootScope.locations == null){
            
                deferred = $http.get($rootScope.service+'/locations')
                .then(function(response){
                    $rootScope.locations = {};
                    _.forEach(response.data, function(loc) {                   
                        $rootScope.locations[loc.id] = loc;                        
                    }); 
                    return $rootScope.locations;
                }); 
            } else {
                 deferred = $q.when($rootScope.locations);  
            }
            
            return deferred; 
        }

        function setLocation(shopLocation) {
            var deferred;
            deferred = $http.post($rootScope.service+'/location/'+shopLocation.id, shopLocation)
            .then(function(response){
                var newLocation = response.data
                if (shopLocation.id == '_'){
                    // New location added
                    $rootScope.locations[newLocation.id] = newLocation;
                }
                return newLocation;
            });
            return deferred;
        }
        
        function deleteLocation(shopLocationId){
            var deferred;            
            deferred = $http.delete($rootScope.service+'/location/'+shopLocationId)
            .then(function(response){
                
                //Remove location from cache
                if (_.has($rootScope.locations, shopLocationId)){
                    delete $rootScope.locations[shopLocationId];
                } 

                //Remove all references to location frrom ingredients
                _.forEach(_.keys($rootScope.ingredients), function(ingredientId){
                   var ingredient = $rootScope.ingredients[ingredientId];
                   ingredient.locations = _.filter(ingredient.locations, function(locationId){
                       return (locationId != shopLocationId);
                   })
                });
                return $rootScope.locations;
            });
            return deferred;
        }
  
        //---------------------------------------------- Shoppig list
        function getShoppingList(id){
            var deferred;
            
            if (($rootScope.shoppingList == null) || (($rootScope.shoppingList.id != '_') && ($rootScope.shoppingList.id != id))){
                deferred= $http.get($rootScope.service+'/shopping-list/'+id)
                    .then(function(response){
                        $rootScope.shoppingList = response.data;
                        $rootScope.checkedItems = {};
                        return $rootScope.shoppingList;
                    });                   
            } else {               
                deferred = $q.when($rootScope.shoppingList);                              
            }            
            return deferred;
        }

        function getCheckedItems(){
            return  $rootScope.checkedItems;
        }
        
        function setShoppingList(shoppingList){
            var deferred;
            deferred = $http.post($rootScope.service+'/shopping-list/'+shoppingList.id, shoppingList)
                .then(function(response){
                        $rootScope.recipes = null;
                        $rootScope.shoppingList = response.data;
                        return $rootScope.shoppingList;
                });
            return deferred;
        }
        
        function ShoppingListCommand(cmd){
            return {
                'action' : cmd
            }
        }
        
        function addShoppingListRecipe(id){
            var deferred;
            deferred = $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('add'))
            .then(function(response) {
                $rootScope.recipes[id].in_shopping_list = true;
                if (($rootScope.recipe) && ($rootScope.recipe.id == id)){
                    $rootScope.recipe.in_shopping_list = true;
                }
            });
            return deferred;
        }
        
        function removeShoppingListRecipe(id){
            var deferred;
            deferred = $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('remove'))
            .then(function(response) {
                $rootScope.recipes[id].in_shopping_list = false;
                 if (($rootScope.recipe) && ($rootScope.recipe.id == id)){
                    $rootScope.recipe.in_shopping_list = false;
                }
            });
            return deferred;
        }

        //--------------------------------------------- Statistics
        function getStats(){
            var deferred;
            deferred = $http.get($rootScope.service+'/stats')
            .then(function(response) {
                return response.data;
            });
            return deferred; 
        }
    }
})();