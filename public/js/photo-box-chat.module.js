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
            .state('index.dialogs', {
                url: "/chat/:chatId",
                views: {
                    "message-list@": {
                        templateUrl: "message-list.html",
                        controller: 'messageListController'
                    }
                }
                // onEnter: function() {
                //     console.log("enter");
                // },
                // onExit: function() {
                //     console.log("exit");
                // }
            });
    }
})();
