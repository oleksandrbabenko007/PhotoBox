// var app = angular.module('angularApp', []);
// app.controller('angularAppContorller', function($q) {

//     function mySetTimeout(time) {
//         return $q(function(resolve, reject) {
//             setTimeout(function() {
//                 resolve("Resolve");
//             }, time);
//             setTimeout(function() {
//                 reject("reject");
//             }, 2000);
//         });
//     }

//     console.log('before');

//     mySetTimeout(1000)
//         .then(function() {
//             console.log('after');
//         })
//         .catch(function() {
//             console.log('Error');
//         })
//         .finally(function() {
//             console.log("finish");
//         });    
// });

var app = angular.module('angularApp', []);
app.controller('angularAppContorller', function($q) {

    function mySetTimeout(time) {
        var deferred = $q.defer();
        setTimeout(function() {
            deferred.resolve("Resolve");
        }, time);
        setTimeout(function() {
            deferred.reject("reject");
        }, 2000);
        return deferred.promise;
    }

    console.log('before');

    var promise = mySetTimeout(1000);
    promise
    .then(function() {
        console.log('after');
    })
    .catch(function() {
        console.log('Error');
    })
    .finally(function() {
        console.log("finish");
    });
});
