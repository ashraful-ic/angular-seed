(function(){

    angular.module('seed').controller('AppCtrl', Ctrl);

    /* @ngInject */
    function Ctrl($scope, $http){
        console.info('In tha controller...');

        console.info('Testing lodash...', _.contains([1, 2, 3], 1));

        $scope.timestamp = new Date();
    }

})();

