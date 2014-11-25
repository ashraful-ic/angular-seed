(function(){

    angular.module('seed').controller('AppCtrl', Ctrl);

    /* @ngInject */
    function Ctrl($http){
        console.info('In tha controller...');
    }

})();

