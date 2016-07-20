/**
 * Created by oleksander on 09.06.16.
 */
(function() {
    'use strict';

    angular
        .module('photo-box-chat')
        .controller('messageListController', messageListController)
    ;

    function messageListController($http, $scope, $interval, $stateParams, $window, $rootScope) {
        $scope.deleteMessage = deleteMessage;
        $scope.isMyMessage = isMyMessage;
        var scroller = document.getElementById("autoscroll");

        activate();

        function activate() {
            listChatMessages();
            $interval(listChatMessages, 1000);
        }

        $scope.submit = function() {
            var req = {idChat: $stateParams.chatId, message: $scope.text};
            $http.post('/sendMessage', req)
                .then(function(res) {
                    if (res.data.error) {
                        $window.alert("You are not logged in!");
                        return;
                    }
                    return listChatMessages();
                })
                .catch(function(response) {
                    console.log(response);
                })
            ;
            $scope.text = "";
        };

        function listChatMessages() {
            var req = {idChat: $stateParams.chatId};
            scroller.scrollTop = scroller.scrollHeight;
            return $http.post('/dataFromDataBase', req)
                .then(function(response) {
                    $scope.usersMessage = response.data;
                });
        }

        function deleteMessage(value) {
            $scope.value = value;
            var idMessageDelete = {idDelete: value};
            $http.post('/deleteMessage', idMessageDelete);
            listChatMessages();
        }

        function isMyMessage(author) {
            return author === $scope.user.login;
        }
    }
})();

