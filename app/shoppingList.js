(function() {
    'use strict';
    
    angular.module('app').controller('ShoppingListController', ShoppingListController);
    
    ShoppingListController.$inject = ['DataService', 'AlertService', '$log', '$state', '$stateParams', 'ModalService'];

    function ShoppingListController(DataService, AlertService, $log, $state, $stateParams, ModalService){
        var vm = this;
        
        vm.localId = 0;
        vm.regex = '(\\d+[\\.,]?\\d*)\\s*([A-Za-z]\\w*)';   
        
        vm.shoppingList = null;
        vm.ingredients = {};
        vm.listIngredients = [];        
        vm.selectedShopId = null;
        vm.shops = {};
        vm.locations = {};
        vm.getCheckedItems = {};
        
        vm.deleteItem = deleteItem;
        vm.addItem = addItem;
        vm.getIngredientNames = getIngredientNames;
        vm.getShops = getShops;
        vm.setShop = setShop;
        vm.getShopLocations = getShopLocations;
        vm.deleteShopLocation = deleteShopLocation
        vm.getListIngredients =getListIngredients;
        vm.getIngredient = getIngredient;
        vm.ingredientInLocation = ingredientInLocation;
        vm.ingredientInShop = ingredientInShop;
        vm.allIngredientsInLocation = allIngredientsInLocation;
        vm.isItemChecked = isItemChecked;
        
        vm.modalAddLocation = modalAddLocation;
        vm.modalEditLocation = modalEditLocation;
        vm.modalChangeLocation = modalChangeLocation;
        vm.modalDeleteLocation = modalDeleteLocation;
        vm.modalAddShop = modalAddShop;
        vm.modalEditShop = modalEditShop;
        vm.modalDeleteShop = modalDeleteShop;
        
        vm.edit = edit;
        vm.organize = organize;
        vm.create = create;
        
        vm.save = save;
        vm.cancel = cancel;        
        
        vm.loading = {};
        vm.loading.shoppingList = false;
        vm.loading.shops = false;
        vm.loading.currentShop = false;
        vm.loading.locations = false;
        vm.loading.ingredients = false;
        vm.isLoading = isLoading;
        
        vm.addingItem = null;
        vm.editingLocation = null;
        vm.addingLocation = false;
        vm.settingLocation = false;
        vm.addingShop = false;
        vm.editingShop = false;
        vm.deletingShop = false;
        vm.selectingShop = false;
        
        vm.saving = false;
        vm.creating = false;
        vm.showingShopEdits = false;
        
        //---------------------------------------------- Loading
        _loadData($stateParams.id);
        
        function _loadData(id){
            $log.info('loading shopping list: '+ id);     
            _resetLoading();
            
            //-------------------------- load shopping list
            DataService.getShoppingList(id)
            .then(function(shoppingList){
                vm.shoppingList = JSON.parse(JSON.stringify(shoppingList)); 
                var allIngredients = _getAllIngredients(vm.shoppingList.items);
                vm.listIngredients = _getUniqueIngredients(allIngredients);              
                vm.getCheckedItems = DataService.getCheckedItems();
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load shopping list (code  ' + error.status + ').');
            })            
            .finally(function(){
                 vm.loading.shoppingList = false;   
            }); 
            
            //-------------------------- load shops
            DataService.getShops()
            .then(function(shops){
                vm.shops = shops;
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load list of shops (code  ' + error.status + ').');
            })
            .finally(function(){
                vm.loading.shops = false;
            });
            
            //-------------------------- load current shop
            DataService.getCurrentShop()
            .then(function(currentShop){
                vm.selectedShopId = currentShop.id;
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load current shop (code  ' + error.status + ').');
            })
            .finally(function(){
                vm.loading.currentShop = false;
            });
            
            //-------------------------- load locations
            DataService.getLocations()
            .then(function(locations){
                vm.locations = locations;   
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load list of locations (code  ' + error.status + ').');
            })
            .finally(function(){
                 vm.loading.locations = false;
            });
            
            //-------------------------- load ingredients
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
        
        //Group unique ingredients among the items of a shopping list
        function _getAllIngredients(items){
            var mapIngredients = {};            
            
            function processItem(item, factor){
                var ingredientId = item.ingredient;
                var unit = item.unit;
                var quantity = item.quantity * factor;
                
                if (!_.has(mapIngredients,ingredientId)){
                  mapIngredients[ingredientId] = {}   
                          
                }
                if (!_.has(mapIngredients[ingredientId],unit)){
                  mapIngredients[ingredientId][unit] = []
                }
                mapIngredients[ingredientId][unit].push(quantity);
            }
            
            _.forEach(items, function(item) {
              if (item.ingredient != null){
                  processItem(item, 1);
              } else if (item.recipe != null){
                  _.forEach(item.recipe.recipe_ingredients, function(recipeItem) {
                      processItem(recipeItem, item.quantity*1.0/ item.recipe.serves);
                  });
              }
            });
            
            return mapIngredients;            
        }       
        
        // Aggregate the ingredients in a shopping list
        function _getUniqueIngredients(mapIngredients){
            var listIngredients = {};          
            var quantity;
            _.forEach(_.keys(mapIngredients), function(ingredientId) {
                quantity = '';
                _.forEach(_.keys(mapIngredients[ingredientId]), function(unit) {
                    if (unit != 'name'){
                        mapIngredients[ingredientId][unit] = mapIngredients[ingredientId][unit].reduce((a, b) => a + b, 0);
                        var roundedQunatity = Math.round(mapIngredients[ingredientId][unit] * 10) / 10;
                        quantity = quantity + roundedQunatity + ' ' + unit + ' + ';
                    }
                 }); 
                 quantity = quantity.substring(0, quantity.length - 3);
                 listIngredients[ingredientId] = {'id':ingredientId, 'quantity':quantity};
            });
            return listIngredients;
        }   
        
        //---------------------------------------------- Shopping list 
        function save(){
            vm.saving = true;
            DataService.setShoppingList(vm.shoppingList)
                .then(function(response){
                    $state.go('shopping-list',{'id' : vm.shoppingList.id}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not save shopping list (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.saving = false;
                });
        }
        
        function cancel(){
            $state.go('shopping-list',{'id' : vm.shoppingList.id}); 
        }
        
        function edit(){
            $state.go('shopping-list-edit',{'id' : vm.shoppingList.id});
        }
        
        function organize(){
            $state.go('shopping-list-organize',{'id' : vm.shoppingList.id}); 
        }

        function create(){
            vm.creating = true;
            var shoppingList = {'id':'_','items':[]}
            DataService.setShoppingList(shoppingList)
                .then(function(shoppingList){
                    $state.go('shopping-list',{'id' : '_'},{reload: true}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not create new shopping list (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.creating = false;
                });            
        }

        function isItemChecked(ingredientId){
            if (_.has(vm.getCheckedItems, ingredientId)){
                return vm.getCheckedItems[ingredientId];
            }
            else{
                return false;
            }
        }

        
        //---------------------------------------------- Shops 
        function setShop(){
            vm.selectingShop = true;
            DataService.setCurrentShop(vm.selectedShopId)
            .then(function(shop){
                //nop
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not select shop (code  ' + error.status + ').');
            })
            .finally(function(){
                vm.selectingShop = false;
            }); 
        }
        
        function getShops(){
            return _.values(vm.shops);
        }
        
        function modalAddShop(){
            ModalService.showModal({
              templateUrl: 'modalEntryEdit.html',
              controller: 'ModalEntryEditController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Add new shop',
                  oldEntry: ''
              }
            })
            .then(function(modal) {
              modal.element.modal();
              angular.element('#entryField').focus();
              modal.close.then(function(shopName) {
                if (shopName != null){
                    vm.addingShop = true;
                    var newShop = DataService.Shop(shopName);
                    DataService.setShop(newShop)
                    .then(function(shop){
                        vm.selectedShopId = shop.id;
                        setShop();
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not create new shop (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.addingShop = false;
                        vm.showingShopEdits = false;
                    }); 
                }                
              });
            });
        }

        function modalEditShop(shop){
            ModalService.showModal({
              templateUrl: 'modalEntryEdit.html',
              controller: 'ModalEntryEditController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Edit shop: ' + shop.name,
                  oldEntry: shop.name
              }
            })
            .then(function(modal) {
              modal.element.modal();
              angular.element('#entryField').focus();
              modal.close.then(function(shopName) {
                if (shopName != null){
                    vm.editingShop = shop.id;
                    var newShop = JSON.parse(JSON.stringify(shop));
                    newShop.name = shopName;
                    DataService.setShop(newShop)
                    .then(function(resultShop){
                        shop.name = resultShop.name;
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not load updated shop (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.editingShop = false;
                        vm.showingShopEdits = false;
                    }); 
                }
              });
            });
        }

        function modalDeleteShop(shopId){
            ModalService.showModal({
              templateUrl: 'modalYesNo.html',
              controller: 'ModalYesNoController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Delete shop: ' + vm.shops[shopId].name + ' ?'
              }
            })
            .then(function(modal) {
              modal.element.modal();
              modal.close.then(function(choiceName) {
                if (choiceName == 'yes'){
                    vm.deletingShop = true;
                    DataService.deleteShop(shopId)
                    .then(function(locations){
                        //nop
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not delete shop (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.deletingShop = null;
                        vm.showingShopEdits = false;
                    }); 
                }
              });
            });
        }

        //---------------------------------------------- Locations 
        function modalAddLocation(){
            ModalService.showModal({
              templateUrl: 'modalEntryEdit.html',
              controller: 'ModalEntryEditController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Add new tag',
                  oldEntry: ''
              }
            })
            .then(function(modal) {
              modal.element.modal();
              angular.element('#entryField').focus();
              modal.close.then(function(locationName) {
                if (locationName != null){
                    vm.addingLocation = true;
                    var newLocation = DataService.Location(locationName);
                    DataService.setLocation(newLocation)
                    .then(function(location){
                        // Nop
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not create new tag (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.addingLocation = false;
                    }); 
                }                
              });
            });
        }

        function modalEditLocation(location){
            ModalService.showModal({
              templateUrl: 'modalEntryEdit.html',
              controller: 'ModalEntryEditController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Edit tag: '+ location.name,
                  oldEntry: location.name
              }
            })
            .then(function(modal) {
              modal.element.modal();
              angular.element('#entryField').focus();
              modal.close.then(function(locationName) {
                if (locationName != null){
                    vm.editingLocation = location.id;
                    var newLocation = JSON.parse(JSON.stringify(location));
                    newLocation.name = locationName;
                    DataService.setLocation(newLocation)
                    .then(function(resultLocation){
                        location.name = resultLocation.name;
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not load updated tag (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.editingLocation = false;
                    }); 
                }                
              });
            });
        }

        function modalChangeLocation(ingredientId, oldLocationId){
            ModalService.showModal({
              templateUrl: 'modalListSelect.html',
              controller: 'ModalListSelectController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Select tag for ' + vm.ingredients[ingredientId].name,
                  locations: _.filter(vm.locations, {'shop' : vm.selectedShopId})
              }
            })
            .then(function(modal) {
              modal.element.modal();
              modal.close.then(function(shopLocation) {
                if (shopLocation != null){
                    vm.settingLocation = ingredientId;

                    var ingredient = JSON.parse(JSON.stringify(vm.ingredients[ingredientId]));

                    ingredient.locations = _.filter(ingredient.locations,function(o){ return o!= oldLocationId });
                    ingredient.locations.push(shopLocation);

                    DataService.setIngredient(ingredient)
                    .then(function(newIngredient){
                        vm.ingredients[ingredientId] = newIngredient;
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not update ingredient tag (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.settingLocation = null;
                    }); 

                }
              });
            });
        }

        function modalDeleteLocation(locationId){
            ModalService.showModal({
              templateUrl: 'modalYesNo.html',
              controller: 'ModalYesNoController',
              controllerAs : 'vm',
              inputs:{
                  title: 'Delete tag: ' + vm.locations[locationId].name + ' ?'
              }
            })
            .then(function(modal) {
              modal.element.modal();
              modal.close.then(function(choiceName) {
                if (choiceName == 'yes'){
                    vm.editingLocation = locationId;
                    DataService.deleteLocation(locationId)
                    .then(function(locations){
                        //nop
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not delete tag (code  ' + error.status + ').');
                    })
                    .finally(function(){
                        vm.editingLocation = null;
                    }); 
                }
              });
            });
        }
        
        function getShopLocations(shopId){
            return _.filter(_.values(vm.locations), function(loc){return loc.shop == shopId});            
        } 
        
        function deleteShopLocation(shopLocationId){
            
            vm.editingLocation = shopLocationId;
            DataService.deleteLocation(shopLocationId)
            .then(function(locations){
                 _.forEach(_.keys(vm.ingredients), function(ingredientId) {
                    var ingredient = vm.ingredients[ingredientId];
                    ingredient.locations = _.filter(ingredient.locations,function(o){ return o!= shopLocationId })
                    });
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not delete tag (code  ' + error.status + ').');
            })
            .finally(function(){
                vm.editingLocation = null;
            }); 
        }
        
        function ingredientInLocation(ingredientId, locationId){
            return (vm.ingredients[ingredientId].locations.indexOf(locationId) >= 0);
        }

        function ingredientInShop(ingredientId, shopId){
            var ingredientShops = _.map(vm.ingredients[ingredientId].locations,
                function(locationId) {return vm.locations[locationId].shop}
                )
            return (ingredientShops.indexOf(shopId) >= 0);
        }

        function allIngredientsInLocation(shopId){
            var unsortedIngredients = _.filter(_.keys(vm.listIngredients), function(ingredientId){
                return !ingredientInShop(ingredientId, shopId);
            })
            return _.isEmpty(unsortedIngredients);
        }
        
        //---------------------------------------------- Ingredients
        function getListIngredients(){
            return _.values(vm.listIngredients);
        }
        
        function getIngredient(ingredientId){
            return vm.ingredients[ingredientId].name;
        }
        
        function deleteItem(id){
            for( var i = 0; i< vm.shoppingList.items.length; i++){
                var item = vm.shoppingList.items[i];
                if (item.id == id){
                    vm.shoppingList.items.splice(i,1);
                    break;
                }
            }
        }
        
        function getIngredientNames(){
            var result = _.values(vm.ingredients);
            result = _.map(result, function(o){return o.name});
            return result;
        }
        
        function addItem(focusField){

            if ((vm.ingredient != null) && (vm.quantity != null)) {                
                vm.addingItem = true;
                DataService.getIngredient(vm.ingredient)
                .then(function(ingredient){
                    
                    var matches = vm.quantity.match(vm.regex);
                    var amount = matches[1].replace(",", ".");
                    var unit = matches[2];

                    vm.shoppingList.items.push(DataService.Item(vm.localId,ingredient.id,amount,unit));
                    vm.localId++;
                    vm.ingredient = null;
                    vm.quantity = null;
                    angular.element('#'+focusField).focus();
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not retrieve ingredient (code  ' + error.status + ').');
                })
                .finally(function(){
                    vm.addingItem = null;
                });
            }
        }
    };
})();