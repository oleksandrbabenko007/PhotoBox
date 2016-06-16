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
        $scope.isMyMessage = isMyMessage;
        $scope.user = {};

        activate();

        function activate() {
            listChatMessages();
            $interval(listChatMessages, 1000);
            updateDialogList();
            $interval(updateDialogList, 3000);
        }

        $scope.submitUser = function() {
            var req = {userSelect: $scope.userChat};
            $http.post('/startChat', req)
                .then(function(res) {
                    window.location.href = "/users-chat-page.html?chat=" + res.data.idChat;
                });
        };

        $scope.submit = function() {
            var userId = window.location.search;
            var arr = userId.split('=');
            var req = {idChat: arr[arr.length - 1], message: $scope.text};
            $http.post('/sendMessage', req)
                .then(function(res) {
                    if (res.data.error) { 
                        alert("You are not logged in!");
                        return; 
                    }
                    return listChatMessages();
                })
                .catch(function(response) {
                    console.log(response);
                })
            ;
        };

        function updateDialogList() {
            $http.get('/dialogsList')
                .then(function(response) {
                    if (response.data.error) {
                        $scope.usersMassive = [];
                        return;
                    }
                    $scope.usersMassive = response.data;
                })
            ;
        }

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

        function isMyMessage(author) {
            return author === $scope.user.login;
        }
    }
})();
