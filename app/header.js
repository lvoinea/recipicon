(function() {
    'use strict';
    
    angular.module('app').controller('HeaderController', HeaderController);
    
    HeaderController.$inject = ['$stateParams','AlertService'];

    function HeaderController($stateParams, AlertService){
        var vm = this;
        
        vm.selection = $stateParams.selection;
        vm.clearAlert = clearAlert;
        
        function clearAlert(index){
            AlertService.clearAlert(index);
        }
    };
    
})();