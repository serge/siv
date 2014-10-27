angular.module('main', [])
.directive('navArrow', function() {
    "use strict";
    return {
        templateUrl: "partials/arrow_next",
        restrict: 'A',
        scope: {
            next: '='
        }
    };
})
.controller('ctr', function($scope, $http, $window) {
    $scope.url = '#';
    $scope.id = 0;
    $scope.deleted = [];

    $http.get('/deleted').success(function(resp) {
        $scope.deleted = resp;
    });

    $scope.apps = {settings: {gallery:false, deleted_gallery:false}};
    function fit_into(obj, W, H) {
        var w = obj.width, h = obj.height,
            rw = W / w,
            rh = H / h,
            nh = h,
            nw = w,
            style;
        if (w > W || h > H) {
            if (rw * h < H) {
                nh = rw * h;
                nw = W;
            } else {
                nw = rh * w;
                nh = H;
            }
        }
        style = {
            width:nw,
            height: nh,
            left:(W - nw) / 2,
            top:(H - nh) / 2
        };
        _.each(style, function(v, k, item) {
            item[k] = '' + v + 'px';
        });
        return style;
    }
    function set_id(n) {
        n = parseInt(n) % _.size($scope.thumbs);
        var id = $scope.thumbs[n].id;
        $http.get('/image/' + id).success(function(resp) {
            $scope.id = n;
            $scope.url = 'url("/static/' + resp.url + '")';
            $scope.title = resp.url.replace(/_/g, ' ');
            $scope.frame = fit_into({width:$window.innerWidth * .8,
                                     height:$window.innerHeight * .8},
                                    $window.innerWidth,
                                    $window.innerHeight);
            $scope.style = fit_into(resp,
                                    $window.innerWidth * .8,
                                    $window.innerHeight * .8);
            $scope.style.backgroundImage = $scope.url;
            $scope.style.position = 'absolute';
        });
    };
    $scope.set_id = set_id;

    function get_current() {
        return $scope.thumbs[$scope.id];
    }

    $scope.next = function() {
        set_id($scope.id + 1);
    };

    $scope.prev = function() {
        set_id($scope.id + $scope.thumbs.length - 1);
    };

    $scope.is_selected = function(n) {return $scope.id == n;};

    $scope.filter = function(item) {
        $scope.thumbs = $scope.files;
        if(item !== 'all')
            $scope.thumbs = _.filter($scope.files, function(v) { return _.last(v.url.split('.')) === item;});
        $scope.set_id($scope.id);
        $scope.sel_type = item;
    };

    $scope.delete_img = function() {
        var n = $scope.id;
        $http.get('/delete/' + get_current().id).success(function(resp) {
            $scope.deleted.push(get_current());
            init($scope.sel_type);
        });
    };

    $scope.selected_type = function(item) {
        return $scope.sel_type === item;
    };

    function init(selected_type) {
        $http.get('/images').success(function (resp) {
            var indexed = $scope.files = _.toArray(resp.files);

            $scope.types = _.uniq(_.map(resp.files, function(v) {
                return _.last(v.url.split('.'));
            }));

            $scope.types.push('all');
            $scope.filter(selected_type || 'all');
        });
    }

    function undelete(id) {
        $http.get('/undelete/' + $scope.deleted[id].url)
            .success(function(resp) {
                console.log(resp);
            });
    };

    $scope.gallery_event = 'gallery_id';
    $scope.deleted_gallery_event = 'deleted_gallery_id';

    $scope.$on($scope.gallery_event, function(event, arg) {
        set_id(arg.id);
    });

    $scope.$on($scope.deleted_gallery_event, function(event, arg) {
        console.log(arg);
        undelete(arg.id);
    });

    init();
}).directive('thumbsGallery', function () {
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
