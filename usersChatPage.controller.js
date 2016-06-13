/**
 * Created by oleksander on 09.06.16.
 */
(function() {
    'use strict';

    angular
        .module('photo-box')
        .controller('usersChatPageController', usersChatPageController );

    function usersChatPageController($http, $scope, $interval) {
        $scope.deleteMessage = deleteMessage;

        activate();

        function activate() {
            listChatMessages();
            $interval(listChatMessages, 1000);
        }

        $scope.testMassive = { 1: {
                                 paricipants: ["nata", "alex"],
                                 notread: 10
                                 },
                              2: {
                             paricipants: ["kirill", "alex"],
                                 notread: 5
                                 }
                             };

        $scope.submitUser = function() {
            var req = {userSelect: $scope.userChat};

            $http.post('/sendSelectUser', req)
                .then(
                    console.log("Ok")
                );
        };

        $scope.submit = function() {
            var req = {message: $scope.text};
            $http.post('/sendMessage', req)
                .then(function () {
                    return listChatMessages();
                })
                .catch(function (response) {
                    console.log(response);
                });
        };

        $http.get('/usersActivity')
            .then(function(response) {
                $scope.users = response.data;
                console.log($scope.users);
            })
            .catch(function(response) {
                console.log(response);
            });
    };

        function listChatMessages() {
            return $http.get('/dataFromDataBase')
                .then(function(response) {
                    $scope.usersMessage = response.data;
                });
        }

        function deleteMessage($event, value) {
            $scope.value = value;
            var elemMessage = $event.target;
            var myTargetElement = angular.element(elemMessage).parent();
            var idMessageDelete = {idDelete: value};
            $http.post('/deleteMessage', idMessageDelete);
            listChatMessages();
        }
    }
})();
