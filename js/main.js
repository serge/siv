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
.controller('ctr', function($scope, $http, $window) {
    $scope.url = '#';
    $scope.id = 0;
    $scope.apps = {settings: {gallery:false}};
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
        n = n % $scope.thumbs.length;
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

    $scope.selected_type = function(item) {
        return $scope.sel_type === item;
    };

    $http.get('/images').success(function (resp) {
        var indexed = $scope.files = _.map(resp.files, function(v, i) {
            return {url: v, id:i};
        });
        $scope.types = _.uniq(_.map(resp.files, function(v) {
            return _.last(v.split('.'));
        }));
        $scope.types.push('all');
        $scope.filter('all');
    });


}).directive('thumbsGallery', function () {
    return {
        restrict: 'A',
        template: '<div class="thumbnail" ng-repeat="t in thumbs" ' +
            'style=\'background-image:url({{"/thumbs/" + t.url}})\'' +
            'ng-click="set_id($index)"' +
            'ng-class="{selected: is_selected($index)}"' +
            '></div>'
    };
}).directive('fileTypes', function () {
    return {
        restrict: 'A',
        template: '<div ng-repeat="t in types" ' +
            'ng-click="filter(t)"' +
            'ng-class="{selected: selected_type(t)}"' +
            '>{{t}}</div>'
    };
});
