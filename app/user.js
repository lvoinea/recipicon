(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['$rootScope','$location', 'AuthenticationService', 'AlertService', 'DataService'];
    function UserController($rootScope, $location, AuthenticationService, AlertService, DataService) {
        var vm = this;

        vm.username =  $rootScope.auth['user'];
        vm.token =  $rootScope.auth['token'];
        
        vm.closeUp = closeUp;
        vm.clearAlert = AlertService.clearAlert;

        vm.closingOut = false;
        
        function closeUp() {

            vm.closingOut = true;

            DataService.initialize();
            AuthenticationService.clearCredentials();
            AuthenticationService.closeUp()
            .then(function(response){
                $location.path('/login');
            })
            .catch(function(response){
                 AlertService.setAlert(`ERROR: Could not close up account (${error.status})`);
            })
            .finally(function(){
                vm.closingOut = false;
            });
        };
    }

})();
