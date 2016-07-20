/**
 * Created by nata on 09.06.16.
 */
(function() {
    'use strict';

    angular
        .module('photo-box-chat')
        .controller('dialogListController', dialogListController)
    ;

    function dialogListController($http, $scope, $interval, $stateParams) {
        $scope.usersMassive = [];

        activate();

        function activate() {
            activeChat();
            updateDialogList();
            $interval(updateDialogList, 3000);
        }

        function updateDialogList() {
            $http.get('/dialogsList')
                .then(function(response) {
                    if (response.data.error) {
                        return;
                    }
                    $scope.usersMassive = response.data;
                })
            ;
        }

        function activeChat() {
            $scope.tab = $stateParams.chatId;
            return $scope.tab;
        }
    }
})();

