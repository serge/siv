angular.module('directives', [])
.directive('navArrow', function() {
    "use strict";
    return {
        templateUrl: "partials/arrow_next",
        restrict: 'A',
        scope: {
            next: '='
        },
        link: function(scope) {
            scope.path_top = scope.next? [{x:0, y:0}, {x:1, y:1}] : [{x:-2, y:2}, {x:-1, y:3}];
            scope.path_bottom = scope.next? [{x:0, y:3}, {x:1, y:2}]: [{x:-2, y:1}, {x:-1, y:0}];
            scope.width = 10;
        }
    };
})
.directive('thumbsGallery', function () {
    return {
        restrict: 'E',
        scope: {
            thumbs: '=',
            id: '=ngModel',
            event:'='
        },
        templateUrl: 'partials/gallery',
        link: function(scope, element, attr) {
            scope.is_selected = function(n) {return scope.id == n;};
            scope.set_id = function(n) {
                scope.id = n;
                scope.$emit(scope.event, {id: n});
            };
        }
    };
}).directive('fileTypes', function () {
    return {
        restrict: 'A',
        templateUrl: 'partials/file_types'
    };
});
