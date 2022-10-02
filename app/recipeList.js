(function() {
    'use strict';
    
    angular.module('app').controller('RecipesController', RecipesController);
    
    RecipesController.$inject = ['DataService', '$log', '$state'];

    function RecipesController(DataService,$log,$state){
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
                    $log.error('Could not load recipe list');
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
                    AlertService.setAlert('ERROR: Could not add receipe to shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = null;
                });
            }
            else if (!recipe.in_shopping_list){
                DataService.removeShoppingListRecipe(recipe.id)
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not remove recipe from shoopping list  (code ' + error.status + ').');
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