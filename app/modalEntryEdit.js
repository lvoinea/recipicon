(function() {
    'use strict';

    angular.module('app').controller('ModalEntryEditController', ModalEntryEditController);
    
    ModalEntryEditController.$inject = ['$scope', '$element', 'title', 'oldEntry', 'close'];
    
    function ModalEntryEditController($scope, $element, title, oldEntry, close) {

        var vm = this;
    
        vm.entry = oldEntry;     
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