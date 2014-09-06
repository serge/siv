angular.module('main', [])
.directive('arrowPrev', function() {
    "use strict";
    return {
        template:"<div class='arrow_prev' >" +
            "<div class='outer'></div>" +
            "<div class='inner'></div>" +
            "</div>"
    };
})
.directive('arrowNext', function() {
    "use strict";
    return {
        template:"<div class='arrow_next' >" +
            "<div class='outer'></div>" +
            "<div class='inner'></div>" +
            "</div>"
    };
})
.controller('ctr', function($scope, $http) {
    $scope.title = "oy!";
    $scope.url = '#';
    $scope.id = 0;
    $scope.apps = {settings: {gallery:false}};
    function set_id(n) {
        console.log(n);
        if(!$scope.thumbs)
            return;
        $scope.id = n % $scope.thumbs.length;
        $scope.url = 'url("/static/' + $scope.thumbs[$scope.id] + '")';
        $scope.title = $scope.thumbs[$scope.id];
    }

    $scope.next = function() {
        set_id($scope.id + 1);
    };

    $scope.prev = function() {
        set_id($scope.id + $scope.thumbs.length - 1);
    };


    $http.get('/images').success(function (resp) {
        $scope.thumbs = resp.files;
        set_id(0);
    });

    $scope.set_id = set_id;
    $scope.is_selected = function(n) {return $scope.id == n;};

}).directive('thumbsGallery', function () {
    return {
        restrict: 'A',
        template: '<div class="thumbnail" ng-repeat="t in thumbs" ' +
            'style=\'background-image:url({{"/thumbs/" + t}})\'' +
            'ng-click="set_id($index)"' +
            'ng-class="{selected: is_selected($index)}"' +
            '></div>'
    };
});
