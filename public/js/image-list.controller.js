(function() {  
    'use strict';

    angular
    .module('photo-box')
    .controller('imageListController', imageListController)
    .directive('listImages', function() {
        return {
            restrict: 'E',
            templateUrl: 'list-images.html'
        };
    });

    function imageListController($http, $scope) {
        $scope.imageList = {};
        $scope.deleteImage = deleteImage;
        $scope.show = true;

        activate();

        function activate() {
            displayImages();
        }

        function deleteImage($event, imageID) {
            var req = {id: imageID};
            var el = $event.target;
            var myTargetElement = angular.element(el).parent();
            $http({
                url: '/remove_photo',
                method: "POST",
                data: req
            })
            .then(function(response) {
                if (response.data) {
                    myTargetElement.remove();
                    console.log("ok");
                }
            })
            .catch(function() {
                console.log("sorry");
            });
        }

        function displayImages() {
            var url = window.location.search || '';
            if (url) {
                $scope.show = false;
            }
            $http.get('/user_page' + url)
            .then(function(response) {
                return $http.get(response.data[0].images);
            })
            .then(function(response) {
                $scope.imageList = response.data.data;
            })
            ;
        }
    }
}
)();
