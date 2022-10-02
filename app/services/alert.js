(function () {
    'use strict';

    angular
        .module('app')
        .factory('AlertService', AlertService);

    AlertService.$inject = ['$rootScope'];
    function AlertService($rootScope) {
        var service = {
            addAlert: addAlert,
            setAlert: setAlert,
            clearAlert: clearAlert,
            clearAlerts: clearAlerts
        };

        initService();

        return service;

        function initService() {
            $rootScope.$on('$locationChangeStart', function () {
                clearAlertMessages();
            });

            function clearAlertMessages() {
                var alerts = $rootScope.alerts;
                if (alerts) {
                    $rootScope.alerts = alerts.filter(function(entry){entry.keep;});
                } else {
                    $rootScope.alerts = [];
                }
            }
        };

        function addAlert(msg, type, keepAfterLocationChange) {
          type = type || 'danger';
          keepAfterLocationChange = keepAfterLocationChange || false;
          $rootScope.alerts.push({type: type, msg: msg, keep: keepAfterLocationChange});
          scrollToElement('top');
        };
        
        function setAlert(msg,  type, keepAfterLocationChange ) {
          type = type || 'danger';
          keepAfterLocationChange = keepAfterLocationChange || false;
          $rootScope.alerts = [{type: type, msg: msg, keep: keepAfterLocationChange}];
          scrollToElement('top');          
        };

        function clearAlert(index) {
          $rootScope.alerts.splice(index, 1);
        };
        
        function clearAlerts() {
          $rootScope.alerts = [];
        };
        
        function scrollToElement(id){
             angular.element("body").animate({scrollTop: angular.element('#'+id).offset().top}, "slow");
        };
    }

})();