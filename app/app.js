(function () {
    'use strict';

    angular
        .module('app', ['ui.router', 'ngCookies', 'ui.bootstrap','angularModalService','ngFileUpload'])
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('recipes', {
                url: '/recipes',
                params: {
                    selection: 'recipes'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'RecipesController',
                        templateUrl: 'recipeList.html',
                        controllerAs: 'vm'
                    }
                }
                
            })
            
            .state('recipe', {
                url: '/recipe/:id',
                params: {
                    selection: 'recipe'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'RecipeController',
                        templateUrl: 'recipe.html',
                        controllerAs: 'vm'
                    }
                }
                
            })
            
            .state('recipe-edit', {
                url: '/recipe-edit/:id',
                params: {
                    selection: 'recipe-edit'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'RecipeController',
                        templateUrl: 'recipe.edit.html',
                        controllerAs: 'vm'
                    }
                }
                
            })
            
            .state('shopping-list', {
                url: '/shopping-list/:id',
                params: {
                    selection: 'shopping-list'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'ShoppingListController',
                        templateUrl: 'shoppingList.html',
                        controllerAs: 'vm'
                    }
                }               
            })
            
            .state('shopping-list-edit', {
                url: '/shopping-list-edit/:id',
                params: {
                    selection: 'shopping-list'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'ShoppingListController',
                        templateUrl: 'shoppingList.edit.html',
                        controllerAs: 'vm'
                    }
                }               
            })
            
            .state('shopping-list-organize', {
                url: '/shopping-list-organize/:id',
                params: {
                    selection: 'shopping-list'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'ShoppingListController',
                        templateUrl: 'shoppingList.organize.html',
                        controllerAs: 'vm'
                    }
                }               
            })

            .state('statistics', {
                url: '/statistics',
                params: {
                    selection: 'recipe'
                },
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'StatsController',
                        templateUrl: 'statistics.html',
                        controllerAs: 'vm'
                    }
                }
                
            })

            .state('login', {
                url: '/login',
                params: {
                        'username': '',
                        'token':''
                    },
                views : {
                    "r-header": {},
                    "r-body": {
                        templateUrl: 'authLogin.html',
                        controller: 'LoginController',
                        controllerAs: 'vm'
                    }
                } 
                
            })

            .state('reset', {
                url: '/reset',
                params: {
                        'username': '',
                },
                views : {
                    "r-header": {},
                    "r-body": {
                        templateUrl: 'authLogin.html',
                        controller: 'LoginController',
                        controllerAs: 'vm'
                    }
                } 
                
            })
            
            .state('logout', {
                url: '/logout',
                views : {
                    "r-header": {},
                    "r-body": {
                        controller: 'LogoutController',
                        templateUrl: 'authLogout.html',
                        controllerAs: 'vm'
                    }
                } 
                
            })

            .state('user', {
                url: '/user',
                params: {
                    selection: 'user'
                },
                views : {
                     "r-header": {
                        templateUrl: "header.html",
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'UserController',
                        templateUrl: 'user.html',
                        controllerAs: 'vm'
                    }
                }
            })

            .state('out', {
                url: '/out',
                views : {
                    "r-header": {},
                    "r-body": {
                        templateUrl: 'out.html'
                    }
                }
            })

            $urlRouterProvider.otherwise("/login");
            
            //Configure CSRF
            $httpProvider.defaults.xsrfCookieName = 'csrftoken';
            //$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
            $httpProvider.defaults.xsrfHeaderName = null;
            
    }

    run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    function run($rootScope, $location, $cookieStore, $http) {

        //Configure service path
        var host = window.location.host;
        if (host.startsWith("127.") || host.startsWith("192.")){
            $rootScope.service = '/api';            
        } 
        else {
            $rootScope.service = '/service/api';
        }
        $rootScope.recipes = null;          // The list of known recipes
        $rootScope.recipe = null;           // Currently selected entitites
        $rootScope.ingredients = null;      // List of user known ingredients (id,name, [locationId])
        $rootScope.shoppingList = null;     // Currently selected shopping list
        $rootScope.shops = null;            // List of user known shops (id, name)
        $rootScope.currentShop = null;      // Currently selected shops
        $rootScope.locations = null;        // List of locations (id, name, shopId)
        $rootScope.checkedItems = null;     // List of checked items

    }

})();