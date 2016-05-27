(function() {
    'use strict';

    angular
        .module('photo-box')
        .controller('UserListController', UserListController);

    function UserListController($scope, $http, $interval) {
        $scope.users = {};
        var stop;

        activate();

        function activate() {
            displayUserList();
            stop = $interval(displayUserList, 5000);
        }

        function displayUserList() {
            $http.get('/usersActivity')
                .then(function(response) {
                    $scope.users = response.data;
                })
                .catch(function(response) {
                    console.log(response);
                })
            ;
        }

        $scope.$on('$destroy', function() {
            $interval.cancel(stop);
        });
    }
})();

// dependency injection - $http (inversion of control, hollywood principle)
// controller as and $scope
// promices , then, catch, finally $q !== Promise
