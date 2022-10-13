(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', '$stateParams', '$state', '$rootScope', 'AuthenticationService', 'AlertService','ModalService'];
    function LoginController($location, $stateParams, $state, $rootScope, AuthenticationService, AlertService, ModalService) {
        var vm = this;

        vm.login = login;
        vm.signup = signup;
        vm.requestPasswordRequest = requestPasswordRequest;
        vm.resetPassword = resetPassword;
        vm.setMode = setMode;
        vm.modalTerms = modalTerms;
        vm.minPasswordLength = 3;
        vm.username = $stateParams.username;
        vm.token = $stateParams.token;
        vm.redirect = $stateParams.redirect;
        vm.forgot = false;
        vm.agreement = false;

        vm.mode = 'signin';
        vm.clearAlert = clearAlert;

        (function initController() {
            AuthenticationService.clearCredentials();
            if (vm.token != ''){
                vm.mode = 'reset';
            }
        })();

        function login() {
            clearMessages()
            vm.dataLoading = true;
            AuthenticationService.login(vm.username, vm.password)
            .then(function(response){
                if (vm.redirect){
                    $location.url(vm.redirect);
                }
                else {
                    $location.url('/recipes');
                }
                AuthenticationService.setCredentials(vm.username);
            })
            .catch(function(response) {               
                if (response.status == 401){
                   vm.forgot = true;
                }
                AlertService.setAlert(`ERROR: Could not login (${error.status})`);
            })
            .finally(function(){
                vm.dataLoading = false;
            });
        };

        function signup() {
            clearMessages()
            vm.dataLoading = true;
            if (vm.password != vm.confirmPassword) {
                AlertService.setAlert('ERROR: The two passwords do not match.');
                vm.dataLoading = false;
            } else if (! vm.agreement) {
                AlertService.setAlert('ERROR: You can sign-up only if you agree with the service terms and conditions (see checkbox below).');
                vm.dataLoading = false;
            } else{
                AuthenticationService.signup(vm.username, vm.username, vm.password, vm.confirmPassword)
                .then(function(response){
                    $location.path('/recipes');
                    AuthenticationService.setCredentials(vm.username)
                })
                .catch(function(response){
                    AlertService.setAlert(`ERROR: Could not signup (${error.status})`);
                })
                .finally(function(){
                    vm.dataLoading = false;
                });
            }
        };

        function requestPasswordRequest() {
            clearMessages();
            vm.dataLoading = true;
             AuthenticationService.requestPasswordReset(vm.username, vm.passwordNew)
                .then(function(response){
                    $location.path('/out');
                })
                .catch(function(response){
                    AlertService.setAlert(`ERROR: Could not request password reset (${error.status})`);
                })
                .finally(function(){
                    vm.dataLoading = false;
                });
        }

        function resetPassword() {
            clearMessages();
            vm.dataLoading = true;
             if (vm.passwordNew != vm.confirmPassword) {
                AlertService.setAlert('ERROR: The two passwords do not match.');
                vm.dataLoading = false;
            } else {
                AuthenticationService.resetPassword( vm.username, vm.password, vm.passwordNew)
                .then(function(response){
                    $state.go('login',{'username': vm.username})
                })
                .catch(function(response){
                    AlertService.setAlert(`ERROR: Could not reset password (${error.status})`);
                })
                .finally(function(){
                    vm.dataLoading = false;
                })
            }
        }

        function setMode(mode) {
            vm.mode = mode;
            vm.forgot = false;
            AlertService.clearAlerts();
        }
        
        function clearAlert(index){
            AlertService.clearAlert(index);
        }

        function clearMessages(){
            AlertService.clearAlerts();
            vm.forgot = false;
        }

        function modalTerms(){
            ModalService.showModal({
              templateUrl: 'modalTerms.html',
              controller: 'ModalTermsController',
              controllerAs : 'vm'
            })
            .then(function(modal) {
              modal.element.modal();
              modal.close.then(function(choiceName) {
                
              });
            });
        }
    }

})();
