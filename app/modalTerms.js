(function() {
    'use strict';

    angular.module('app').controller('ModalTermsController', ModalTermsController);
    
    ModalTermsController.$inject = ['$scope', '$element', 'close'];
    
    function ModalTermsController($scope, $element, close) {

        var vm = this;
    
        vm.entryClose = entryClose
        
        function entryClose(result) {
            
            //  Manually hide the modal using bootstrap.
            $element.modal('hide');

            //  Now close as normal, but give 500ms for bootstrap to animate
            close(result, 200);
        };
    };

})();