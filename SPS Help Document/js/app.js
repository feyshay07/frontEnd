(function() {
    'use strict';
    
    angular.module('helpSystemDemo', ['helpSystem'])
        .controller('MainController', ['$scope', function($scope) {
            $scope.customer = {};
            
            // Demo customer data
            $scope.customer = {
                name: '',
                type: '',
                priceLevel: '',
                paymentTerms: '',
                taxCode: ''
            };
            
            // Optional: Add form submission logic
            $scope.submitForm = function() {
                console.log('Customer created:', $scope.customer);
            };
        }]);
})();