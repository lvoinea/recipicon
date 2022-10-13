(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$cookieStore', '$location', '$rootScope', '$timeout'];
    function AuthenticationService($http, $cookieStore, $location, $rootScope, $timeout) {
        var service = {};

        service.login = login;
        service.logout = logout;
        service.signup = signup;
        service.closeUp = closeUp;
        service.resetPassword = resetPassword;
        service.requestPasswordReset = requestPasswordReset;
        service.setCredentials = setCredentials;
        service.clearCredentials = clearCredentials;
        service.ensureAuthorized = ensureAuthorized;

        return service;

        function login(username, password) {
            var defered;
            $http.defaults.useXDomain = true;           
            defered = $http.post($rootScope.service+'/auth/login', { username: username, password: password });
            return defered;
        }

        function signup(username, email, password, confirmPassword) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/auth/signup', { username: username, email: email, password: password, confirmPassword: confirmPassword });
            return defered;
        }
        
        function logout() {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.get($rootScope.service+'/auth/logout');
            return defered;
        }

        function closeUp(username) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.get($rootScope.service+'/auth/closeup');
            return defered;
        }

        function resetPassword(username, password, passwordNew) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/auth/password-reset', { username, password, passwordNew });
            return defered;
        }

        function requestPasswordReset(username) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/auth/request-password-reset', {username});
            return defered;
        }

        function setCredentials(user) {
            $rootScope.auth = {
                user: user,
            };
        }

        function clearCredentials() {
            $rootScope.auth = {};
            $cookieStore.remove('csrftoken');
        }

        // Request a successful login before returning to the current location
        function ensureAuthorized() {
            $location.url(`/login?redirect=${$location.url()}`);
        }
    }

})();