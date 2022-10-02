(function() {
    'use strict';

    angular.module('app').controller('ModalListSelectController', ModalListSelectController);
    
    ModalListSelectController.$inject = ['$scope', '$element', 'title', 'locations', 'close'];
    
    function ModalListSelectController($scope, $element, title, locations, close) {

        var vm = this;    
        vm.title = title;
        vm.locations = locations;
        vm.modalClose = modalClose;
        
        function modalClose(result) {
            //  Manually hide the modal using bootstrap.
            $element.modal('hide');
            //  Now close as normal, but give 500ms for bootstrap to animate
            close(result, 500);
        };
    };

})();