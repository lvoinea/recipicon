(function() {
    'use strict';
    
    angular.module('app').controller('RecipesController', RecipesController);
    
    RecipesController.$inject = ['$location', '$log', '$state', 'AlertService', 'AuthenticationService', 'DataService'];

    function RecipesController($location, $log, $state, AlertService, AuthenticationService, DataService){
        var vm = this;
        
        vm.recipes = [];
        
        vm.getRecipes = getRecipes;
        vm.selectRecipe = selectRecipe;
        vm.edit = edit;
        
        vm.loading = false;
        vm.selecting = null;
        
        vm.nameFilter = '';
        vm.categoryFilter = '';
        vm.clearNameFilter = clearNameFilter;
        vm.clearCategoryFilter = clearCategoryFilter;
        
        _loadData();

        function _loadData() {
            vm.loading = true;
            DataService.getRecipes()
                .then(function(recipes) {
                    vm.recipes = recipes;
                })
                .catch(function(error){
                    if (error.status == 403){
                        AuthenticationService.ensureAuthorized();
                    }
                    else {
                        AlertService.setAlert(`ERROR: Could not load recipe list (${error.status})`);
                    }
                })
                .finally(function(){
                    vm.loading = false;
                });
        }
        
        function getRecipes(){
            return _.values(vm.recipes);
        }
        
        function edit(){
            $state.go('recipe-edit');
        }
        
        function selectRecipe(recipe){
            vm.selecting = recipe.id;
            if (recipe.in_shopping_list){
                DataService.addShoppingListRecipe(recipe.id)
                .catch(function(error){
                    if (error.status == 403){
                        AuthenticationService.ensureAuthorized();
                    }
                    else {
                        AlertService.setAlert(`ERROR: Could not add recipe to shopping list (${error.status})`);
                    }

                })
                .finally(function(){
                    vm.selecting = null;
                });
            }
            else if (!recipe.in_shopping_list){
                DataService.removeShoppingListRecipe(recipe.id)
                .catch(function(error){
                    if (error.status == 403){
                        AuthenticationService.ensureAuthorized();
                    }
                    else {
                        AlertService.setAlert(`ERROR: Could not remove recipe from shopping list (${error.status})`);
                    }
                })
                .finally(function(){
                    vm.selecting = null;
                });
            }
        }
        
        function clearNameFilter() {
            vm.nameFilter = '';
        }  
        
        function clearCategoryFilter() {
            vm.categoryFilter = '';
        } 
        
    };
})();