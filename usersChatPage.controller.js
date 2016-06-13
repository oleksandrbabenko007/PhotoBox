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

        $scope.submitUser = function() {
            var req = {userSelect: $scope.userChat};
            $http.post('/sendSelectUser', req);
        };

        $scope.submit = function() {
            var userId = window.location.search;
            var arr = userId.split('=');
            var req = {idChat: arr[arr.length-1], message: $scope.text};
            $http.post('/sendMessage', req)
                .then(function() {
                    return listChatMessages();
                })
                .catch(function(response) {
                    console.log(response);
                })
            ;
        };

        $http.get('/dialogsList')
            .then(function(response) {
                $scope.usersMassive = response.data;
                console.log($scope.usersMassive);
            })
        ;

        $http.get('/usersActivity')
            .then(function(response) {
                $scope.users = response.data;
            })
            .catch(function(response) {
                console.log(response);
            })
        ;

        function listChatMessages() {
            var reqUrl = window.location.search || '';
            return $http.get('/dataFromDataBase' + reqUrl)
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
