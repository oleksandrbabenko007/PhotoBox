/**
 * Created by oleksander on 09.06.16.
 */
(function() {
    'use strict';

    angular
        .module('photo-box-chat')
        .controller('usersChatPageController', usersChatPageController)
    ;

    function usersChatPageController($http, $scope, $state) {
        $scope.user = {};

        activate();
        function activate() {
        }

        $scope.submitUser = function() {
            var req = {userSelect: $scope.userChat};
            $http.post('/startChat', req)
                .then(function(res) {
                    $state.go('dialogs', {chatId: res.data.idChat});
                });
        };

        $http.get('/usersActivity')
            .then(function(response) {
                $scope.users = response.data;
            })
            .catch(function(response) {
                console.log(response);
            })
        ;

        $http.get('/loginUser')
            .then(function(res) {
                $scope.user = res.data;
            })
        ;
    }
})();

