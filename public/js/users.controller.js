(function() {
    'use strict';

    angular
        .module('photo-box')
        .controller('UserListController', UserListController)
        .directive('usersList', function() {
            return {
                templateUrl: 'users-list.html'
            };
        });

    function UserListController($scope, $http, $interval) {
        $scope.users = {};
        var stop;

        activate();

        function activate() {
            displayUserList();
            stop = $interval(displayUserList, 30000);
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
