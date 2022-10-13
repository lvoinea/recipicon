(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$rootScope','$location', 'AuthenticationService', 'AlertService', 'DataService'];
    function LogoutController($rootScope, $location, AuthenticationService, AlertService, DataService) {
        var vm = this;
        
        vm.dataLoading = false;
        vm.loggedOut = false;
        
        vm.logout = logout;
        vm.clearAlert = AlertService.clearAlert;

        vm.loggingOut = false;
        
        logout();

        function logout() {

            vm.loggingOut = true;

            DataService.initialize();
            AuthenticationService.clearCredentials();
            AuthenticationService.logout()
            .then(function(response){
                vm.loggedOut = true;
            })
            .catch(function(response){
                 AlertService.setAlert(`ERROR: Could not logout (${error.status})`);
            })
            .finally(function(){
                vm.loggingOut = false;
            });
        };
    }

})();
