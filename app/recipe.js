(function() {
    'use strict';
    
    angular.module('app').controller('RecipeController', RecipeController);
    
    RecipeController.$inject = ['DataService', '$log', '$state', '$stateParams','$q','AlertService','Upload'];

    function RecipeController(DataService, $log, $state, $stateParams, $q, AlertService, Upload){
        var vm = this;
        
        vm.localId = 0;
        vm.regex = '(\\d+[\\.,]?\\d*)\\s*([A-Za-z]\\w*)';        
        
        vm.recipe = null;
        vm.recipeDescription = null;
        vm.ingredients = {};
        vm.file = null;
        
        vm.deleteRecipeIngredient = deleteRecipeIngredient;
        vm.addRecipeIngredient = addRecipeIngredient;
        vm.getIngredients = getIngredients;
        vm.save = save;
        vm.edit = edit;
        vm.cancel = cancel;
        vm.remove = remove;   
        vm.addToBasket = addToBasket;
        vm.removeFromBasket = removeFromBasket;
        vm.setImage = setImage;
        
        vm.loading = {};
        vm.loading.recipe = false;
        vm.loading.recipeList = false;
        vm.loading.ingredients = false;
        vm.isLoading = isLoading;
        
        vm.saving = false;
        vm.deleting = false; 
        vm.selecting = false;
        vm.adding = false;
        vm.settingImage = false;
        
        function _getLocalId(){
            vm.localId++;
            return '_'+vm.localId;
        }
        //---------------------------------------------- Loading
        _loadData($stateParams.id);       
        
        function _loadData(id) {            
            $log.info('loading recipe: '+ id);            
            _resetLoading();
            
            //-------------------------- load recipe
            DataService.getRecipe(id)
            .then(function(recipe){
                vm.recipe = JSON.parse(JSON.stringify(recipe));               
                vm.recipeDescription = vm.recipe.description.split('\n');
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load recipe (code  ' + error.status + ').');
            })            
            .finally(function(){
                 vm.loading.recipe = false;   
            }); 

            //-------------------------- load recipe list
             DataService.getRecipes()
            .then(function(recipes) {
            })
            .catch(function(error){
                $log.error('Could not load recipe list');
            })
            .finally(function(){
                vm.loading.recipeList = false;
            });
            
            //--------------------------- load ingredients
            DataService.getIngredients()
            .then(function(ingredients){
                vm.ingredients = ingredients;                              
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load ingredients (code  ' + error.status + ').');
            })            
            .finally(function(){
                 vm.loading.ingredients = false;   
            });            
        }
        
        function _resetLoading(){
            _.forEach(_.keys(vm.loading), function(key){
                vm.loading[key] = true;
            });
        }

        function isLoading(){
            return _.reduce(_.values(vm.loading), 
                    function(aggregated, n) { return aggregated || n;},
                    false);
        }
        
        //---------------------------------------------- Recipe 
        function save(){
            vm.saving = true;
            DataService.setRecipe(vm.recipe)
                .then(function(newRecipe){
                    $state.go('recipe',{'id' : newRecipe.id}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not save recipe (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.saving = false;
                });
        }
        
        function cancel(){
            if ($stateParams.id != ''){
                $state.go('recipe',{'id' : vm.recipe.id});
            } else {
                $state.go('recipes');
            }            
        }
        
        function edit(){
            $state.go('recipe-edit',{'id' : vm.recipe.id});
        }
        
        function remove(){
            vm.deleting = true
            DataService.deleteRecipe(vm.recipe.id)
                .then(function(response){
                    $state.go('recipes');
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not delete recipe  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.deleting = false;
                });        
        }

        function setImage(){
            vm.settingImage = true;

            Upload.imageDimensions(vm.file)
            .then(function(dimensions){
                var ratio = dimensions.width / dimensions.height;
                $log.info(ratio, dimensions.width);

                Upload.resize(vm.file, {width: 640, height: 640 / ratio, quality: .8, type: 'image/jpeg'})
                .then(function(resizedFile){
                    $log.info(resizedFile);

                    Upload.base64DataUrl(resizedFile)
                    .then(function(url){
                        vm.recipe.image = url;
                    })
                });
            })
            .finally(function(){
                vm.settingImage = false;
            });
        }
   
        //---------------------------------------------- Ingredients
        function getIngredients(){
            return _.map(_.values(vm.ingredients),'name');
        }
        
        function deleteRecipeIngredient(itemId){
            var iItem = vm.recipe.recipe_ingredients.findIndex(
                function(item){ return item.id == itemId}
                );
            if (iItem >= 0) {
                 vm.recipe.recipe_ingredients.splice(iItem,1);
            } 
        }
        
        function addRecipeIngredient(focusField){
            if ((vm.ingredient != null) && (vm.quantity != null)) {                
                
                vm.adding = true;
                DataService.getIngredient(vm.ingredient)
                .then(function(ingredient){
                    
                    var matches = vm.quantity.match(vm.regex);
                    var amount = matches[1].replace(",", ".");
                    var unit = matches[2];

                    vm.recipe.recipe_ingredients.push(DataService.RecipeIngredient(_getLocalId(),ingredient.id,amount,unit));
                    vm.ingredient = null;
                    vm.quantity = null;
                    angular.element('#'+focusField).focus();
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not add ingredient (code  ' + error.status + ').');
                })
                .finally(function(){
                    vm.adding = null;
                });
            }
        }
        
        //---------------------------------------------- Shopping list
        function addToBasket(){
            vm.selecting = true;
            DataService.addShoppingListRecipe(vm.recipe.id)
                .then(function(response){
                    vm.recipe.in_shopping_list = true;
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not add receipe to shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = false;
                });
            
        }
        
        function removeFromBasket(){
            vm.selecting = true;
            DataService.removeShoppingListRecipe(vm.recipe.id)
                .then(function(response){
                    vm.recipe.in_shopping_list = false;
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not remove recipe from shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = false;
                });
        }             
    };
})();