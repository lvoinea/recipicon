(function() {
    'use strict';

    angular.module('app').controller('ModalYesNoController', ModalYesNoController);
    
    ModalYesNoController.$inject = ['$scope', '$element', 'title', 'close'];
    
    function ModalYesNoController($scope, $element, title, close) {

        var vm = this;
    
        vm.title = title;
        vm.entryClose = entryClose
        
        function entryClose(result) {
            
            //  Manually hide the modal using bootstrap.
            $element.modal('hide');

            //  Now close as normal, but give 500ms for bootstrap to animate
            close(result, 200);
        };
    };

})();