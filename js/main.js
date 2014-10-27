angular.module('main', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/main',
            controller: 'mainCtr'
        }).
        when('/:imageId', {
            templateUrl: 'partials/viewer',
            controller: 'viewerCtr'
        }).
        when('/about', {
            templateUrl: 'partials/about',
            controller: 'aboutCtr'
        }).
        otherwise({
            redirectTo: '/'
        });
}])
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
.controller('aboutCtr', function($scope) {
    $scope.app = "Simple image viewer";
}).factory('images', function($http, $rootScope) {
    return {
        files: [],
        types: [],
        sel_type: undefined,
        thumbs: [],
        init:function(selected_type) {
            var that = this;
            $http.get('/images').success(function (resp) {
                var indexed = that.files = _.toArray(resp.files);

                that.types = _.uniq(_.map(resp.files, function(v) {
                    return _.last(v.url.split('.'));
                }));

                that.types.push('all');
                that.filter(selected_type || 'all');
                $rootScope.$broadcast('images');
            });
        },
        filter: function(item) {
            this.thumbs = this.files;
            if(item !== 'all')
                this.thumbs = _.filter(this.files, function(v) { return _.last(v.url.split('.')) === item;});
            this.sel_type = item;
        }
    };
})
.controller('mainCtr', function($scope, $http, $window, $location, images) {

    images.init();
    $http.get('/deleted').success(function(resp) {
        $scope.deleted = resp;
    });

    $scope.$on('images', function(event, data) {
        $location.url('/0');
    });

})
.controller('viewerCtr', function($scope, $http, $window, $location, $routeParams, images) {
    $scope.url = '#';
    $scope.id = $routeParams.imageId || 0;
    $scope.deleted = [];

    console.log('enter controller');
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
        n = parseInt(n) % _.size(images.thumbs);
        var id = images.thumbs[n].id;
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
        return images.thumbs[$scope.id];
    }

    $scope.next = function() {
            $location.url('/' + ($scope.id + 1));
//        set_id($scope.id + 1);
    };

    $scope.prev = function() {
        set_id($scope.id + images.thumbs.length - 1);
    };

    $scope.is_selected = function(n) {return $scope.id == n;};

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

    set_id($routeParams.imageId);
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
