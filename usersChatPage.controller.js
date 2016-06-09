/**
 * Created by oleksander on 09.06.16.
 */
(function() {
    'use strict';

    angular
        .module('photo-box')
        .controller('usersChatPageController', usersChatPageController );

    function usersChatPageController($http, $scope) {
        $scope.testMassive = {1: {
                             paricipants: ["nata", "alex"],
                                 notread: 10
                                 },
                              2: {
                             paricipants: ["kirill", "alex"],
                                 notread: 5
                                 }
                             };
        // $http.post('/sendSelectUser');
        
        $http.get('/usersActivity')
            .then(function(response) {
                $scope.users = response.data;
                console.log($scope.users);
            })
            .catch(function(response) {
                console.log(response);
            });
    };

})();