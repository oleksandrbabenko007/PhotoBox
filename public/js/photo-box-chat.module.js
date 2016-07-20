(function() {
    'use strict';

    angular
        .module('photo-box-chat', ['ui.router'])
        .config(chatPageStates)
    ;

    function chatPageStates($stateProvider) {
        $stateProvider
            .state('index', {
                url: "",
                views: {
                    "dialog-list": {
                        templateUrl: "dialogs-list.html",
                        controller: 'dialogListController'
                    },
                    "message-list": {
                        templateUrl: "no-message.html"
                    }
                }
            })
            .state('dialogs', {
                url: "/chat/:chatId",
                views: {
                    "dialog-list": {
                        templateUrl: "dialogs-list.html",
                        controller: 'dialogListController'
                    },
                    "message-list": {
                        templateUrl: "message-list.html",
                        controller: 'messageListController'
                    }
                }
            });
    }
})();
