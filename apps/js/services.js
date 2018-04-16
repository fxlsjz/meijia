'use strict';

/*
 通用的接口调用类
 author huoyuanyuan
 date 2016/9/23
 */
//页面传参
app.service('pageData', function () {
    var savedData = ''
    this.set = function (data) {
        return savedData = data;
    }
    this.get = function () {
        return savedData
    }

});
app.service('pageData2', function () {
    var savedData = ''
    this.set = function (data) {
        return savedData = data;
    }
    this.get = function () {
        return savedData
    }

});
app.service('pageData3', function () {
    var savedData = ''
    this.set = function (data) {
        return savedData = data;
    }
    this.get = function () {
        return savedData
    }

});
//登录过期
app.factory('errorCode', ['$http', '$window', '$state', 'userInfo', 'Xalert', '$timeout', '$cookies', '$rootScope', '$location', function ($http, $window, $state, userInfo, Xalert, $timeout, $cookies, $rootScope, $location) {
    return {
        code: function (res) {
            if ($cookies.getObject('login')) {
                if (res.error_code == 401 || res.error_code == 400) { //身份验证
                    userInfo.logout();
                    Xalert.loading(res.error_msg, 1000);
                    $rootScope.gologin(true);
                    event.preventDefault();
                    return false;
                }
            }
        }
    }
}]);
//HTML片段转义
app.filter('trustHtml', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    }
}]);
//获取设置用户cookies
app.factory("userInfo", function ($cookies, $cookieStore, $rootScope, $state, $location, $timeout, ENV) {
    var defaultParams = {
        language: 'zh_CN'
    };
    var cookies_name = 'login'; //登录cookie名字
    return {
        //获取登录信息
        getObject: function (key) {
            var userInfo = $cookies.getObject(cookies_name);
            return userInfo ? userInfo : defaultParams;
        },
        //设置登录信息
        setObject: function (userInfoData, value) {
            userInfoData.language = 'zh_CN';
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 365);
            $cookies.putObject(cookies_name, userInfoData, {
                'path': '/',
                'expires': expireDate
            });
            $rootScope.$_userInfo = userInfoData;

        },
        //退出登录
        logout: function () {
            $cookies.remove(cookies_name, {
                'path': '/'
            });
            $cookies.remove("QyWechatOAuth", {
                'path': '/'
            });
            $rootScope.$_userInfo = defaultParams;
        },
        //判断电话号码是否正确
        checkMobile: function (number) {
            var partten = /^(13[0-9]|14[0-9]|15[0-9]|18[0-9]|17[0-9])\d{8}$/i;
            return partten.test(number);
        },
        //判断是否登录
        checkLogin: function () {
            var userInfoData = $cookies.getObject(cookies_name) || {};
            if (!userInfoData.user_id || !userInfoData.token) {
                return false;
            }
            return true;
        },
        //		refreshPage: function($scope, callback) {
        //			//分享出去的页面，未登录用户登录后返回刷新数据
        //			$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        //				if(fromState.name == 'login' && userInfo.checkLogin()) {
        //					if(callback) {
        //						callback(event, toState, toParams, fromState, fromParams);
        //					} else {
        //						$state.reload();
        //					}
        //				}
        //			});
        //		}
    }
});
//接口数据合并处理
app.factory('interfaceHelps', ['userInfo', 'ENV', '$cookies', function (userInfo, ENV, $cookies) {
    return {
        //接口的访问地址，开发环境不同请修改env.js
        request_url: ENV.apiurl,
        extend_params: function (param) {
            var userInfoData = userInfo.getObject();
            var nowTime = new Date().getTime() / 1000;
            var company_id = $cookies.get('company_id');
            if (!company_id) {
                company_id = 'f00dfde1_4119_5556_b9e8_47174d7a55a9';
            }
            var params = {
                user_id: userInfoData.user_id || '',
                token: userInfoData.token || '',
                device_type: 'wechat',
                language: 'zh_CN',
                version: '3.0',
                company_id: company_id,
                time_stamp: nowTime
                //              eid: userInfoData.eid || '0'
            };
            var results = angular.extend(params, param);
            //alert(angular.toJson(results));
            return results;
        }
    }
}]);

//接口调用
app.factory('getInterface', ['$rootScope', '$location', '$state', '$stateParams', '$http', '$timeout', 'interfaceHelps', 'Xalert', 'userInfo', 'errorCode', function ($rootScope, $location, $state, $stateParams, $http, $timeout, interfaceHelps, Xalert, userInfo, errorCode) {
    var startTime = new Date().getTime();
    return {
        request: function (name) {
            return $location.search()[name] || '';
        },
        //提交数据到后台
        post: function (options, call_back_param) {
            var url = interfaceHelps.request_url + options.module;
            var params = interfaceHelps.extend_params(options.params);
            $http({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: params,
                timeout: 1000 * 30
            }).success(function (data, status, header, config) {
                errorCode.code(data);
                call_back_param(data);
            }).error(function (data, status, header, config) {
                // call_back_param({
                //     status: 'N',
                //     error_msg: "请求失败"
                // });
            });
        },
        //从后台获取数据

        jsonp: function (options, call_back_param) {

            var params = '&jsonpcallback=JSON_CALLBACK';
            options.params = interfaceHelps.extend_params(options.params);
            for (var key in options.params) {
                params += "&" + key + "=" + options.params[key];
            }

            var data = options.data || [];
            var url = interfaceHelps.request_url + options.module + params;
            $http.jsonp(url)
                .success(function (results) {
                    errorCode.code(results);
                    if (options.page != false) {
                        var res = options.dataFiled ? results[options.dataFiled] : results.results;
                        angular.forEach(res, function (rows, index, array) {
                            data.push(rows);
                        });
                        options.data = data;

                        options.canLoadMore = true;
                        options.page++;
                        if (!results.page || results.page >= results.pagecount) {
                            options.canLoadMore = false;
                        }
                    }
                    call_back_param(results, options);
                })
                .error(function (data, status) {
                    // console.log(data)
                    // console.log(status);
                    // call_back_param({
                    //     status: 'N',
                    //     error_msg: "请求失败"
                    // });
                });
        }

    }

}]);

//用户登录鉴权处理
app.factory('Authentication', ['$rootScope', 'getInterface', 'userInfo', '$ionicModal', '$ionicPopup', '$location', '$ionicTabsDelegate', '$state', function ($rootScope, getInterface, userInfo, $ionicModal, $ionicPopup, $location, $ionicTabsDelegate, $state) {
    var popup = function () {
        $rootScope.gologin(false);
    }
    return {
        loginPopup: function () {
            popup();
        },
        authorized: function (event, next, callback) {
            var isAuthorized = true;
            var authorizedRoles = next.authorizedRoles || [];
            if (authorizedRoles) {
                var userInfoData = userInfo.getObject();
                angular.forEach(authorizedRoles, function (value, key) {
                    if (value == '@') {
                        if (!userInfoData.user_id || !userInfoData.token) {
                            event.preventDefault();
                            isAuthorized = false;
                            //未登录还是停留在当前路由
                            //                          if (['tab.order'].indexOf(next.name) >= 0) {
                            //                              var a = {'tab.home': 0, 'tab.service': 1, 'tab.technician': 2, 'tab.task': 3, 'tab.order': 4};
                            ////                                alert(a[$state.current.name])
                            //                              $ionicTabsDelegate.$getByHandle('foot-tabs').select(a[$state.current.name], true);
                            //                          }
                            popup();
                        }
                    }
                });
            }
            callback && callback(isAuthorized);
        },
        checkLogin: function (showPopup) {
            var userInfoData = userInfo.getObject();
            var isLogin = !(!userInfoData.user_id || !userInfoData.token);
            if (!isLogin && showPopup == true) {
                //event.preventDefault();
                popup();
                return false;
            } else {
                return isLogin;
            }
        }
    };
}]);

//发布

app.factory('ReleaseCourse', ['$rootScope', 'getInterface', 'userInfo', 'Authentication', '$ionicModal', function ($rootScope, getInterface, userInfo, Authentication, $ionicModal) {
    var initModal = function ($scope) {
        var releaseModal = $ionicModal.fromTemplateUrl('apps/modules/release/templates/index.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (releaseModal) {
            $scope.releaseModal = releaseModal;
            return releaseModal;
        });
        $scope.openReleaseModal = function () {
            $scope.releaseModal.show();
        };
        $scope.closeReleaseModal = function () {
            $scope.releaseModal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.releaseModal.remove();
        });

        return releaseModal;
    };
    return {
        initModal: initModal
    }
}]);

//选择城市
app.factory('SwitchEnterpriseService', ['$rootScope', 'ENV', '$cookies', '$window', 'getInterface', 'userInfo', 'Authentication', '$ionicModal', '$state', 'Xalert', '$timeout', '$ionicPopup', function ($rootScope, ENV, $cookies, $window, getInterface, userInfo, Authentication, $ionicModal, $state, Xalert, $timeout, $ionicPopup) {

    var initModal = function ($scope) {
        var modal = $ionicModal.fromTemplateUrl('apps/templates/city-list.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            return modal;
        });
        $scope.openModal = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.clickModal = function (item) {
            var expireDate = new Date();
            var data = {
                selCity: item.city_name,
                selHome: item.city_has_online,
                selShop: item.city_has_offline,
                cityCode: item.city_code
            };
            expireDate.setDate(expireDate.getDate() + 365);
            $cookies.putObject('selCityInfo', data, {
                'path': '/',
                'expires': expireDate
            });
            $rootScope.selCityInfo = data;
            $scope.closeModal();
        };
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        return modal;
    };
    return {
        initModal: initModal
    }
}]);
//服务切换店面
app.factory('SwitchShopService', ['$rootScope', 'ENV', '$cookies', '$window', 'getInterface', 'userInfo', 'Authentication', '$ionicModal', '$state', 'Xalert', '$timeout', '$ionicPopup', function ($rootScope, ENV, $cookies, $window, getInterface, userInfo, Authentication, $ionicModal, $state, Xalert, $timeout, $ionicPopup) {

    var initModal = function ($scope) {
        var modal = $ionicModal.fromTemplateUrl('apps/modules/service/templates/switch-mask.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            return modal;
        });
        $scope.openModal = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.$on('$stateChangeStart', function (event, toState, fromState) {
            $scope.closeModal();
        });
        $scope.$on('$destroy', function () {

            $scope.modal.remove();
        });

        return modal;
    };
    return {
        initModal: initModal
    }
}]);

//图片预览
app.factory('ImagePreviewModal', ['$rootScope', 'getInterface', 'userInfo', 'Authentication', '$ionicModal', '$stateParams', '$ionicSlideBoxDelegate', '$timeout', '$interval', function ($rootScope, getInterface, userInfo, Authentication, $ionicModal, $stateParams, $ionicSlideBoxDelegate, $timeout, $interval) {
    var initModal = function ($scope) {
        var imagePreviewModal = $ionicModal.fromTemplateUrl('apps/templates/image-preview.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (imagePreviewModal) {
            $scope.imagePreviewModal = imagePreviewModal;
            return imagePreviewModal;
        });

        $scope.openImagePreviewModal = function () {
            $scope.multiple = $stateParams.multiple;
            var pid = $stateParams.pid;
            if ($scope.multiple == 'true' || $scope.multiple == 'list') {
                $scope.slideimgs = true;
                //第几张图片
                $scope.eq = {
                    num: 0
                };
                if (!isNaN($stateParams.index)) {
                    $scope.eq.num = parseInt($stateParams.index);
                }
				var picArray = [];
                var imgs = angular.fromJson($stateParams.src);
//              angular.forEach(imgs, function(value, key) {
//						picArray.push(value.cimg_large);
//						});
                $scope.imagePreviewSrc = imgs.comment_img;
                $scope.items = imgs;
                $scope.totle = $scope.imagePreviewSrc.length;
                $scope.isShowDetail = true;
            } else {
                $scope.isShowDetail = true;
                $scope.page = 1;
                var loadData = function () {
                    var options = {
                        page: $scope.page,
                        data: $scope.imagePreviewSrc,
                        page_size: 1000,
                        canLoadMore: false,
                        module: 'FM_SHOP_PRODUCT_PIC',
                        params: {
                            current_page: $scope.page,
                            page_size: 1000,
                            product_id: pid
                        }
                    };
                    getInterface.jsonp(options, function (results, params) {
                        $scope.slideimgs = true;
                        $scope.page = params.page;
                        $scope.imagePreviewSrc = params.data;
                        $scope.canLoadMoreGoodsList = params.canLoadMore;
                        $scope.totle = results.counts;
                    });
                }
                loadData();
                $scope.eq = {
                    num: 0
                };
                if (!isNaN($stateParams.index)) {
                    $scope.eq.num = parseInt($stateParams.index);
                }
                // $scope.eq.num = parseInt($stateParams.index);
                var imagePreviewSlide = $ionicSlideBoxDelegate.$getByHandle('imagePreview');
                setTimeout(function () {
                    imagePreviewSlide.slide($scope.eq.num);
                    imagePreviewSlide.update();
                });
            }
        };
        $scope.openImagePreviewModal();
        $scope.closeImagePreviewModal = function () {
            $rootScope.goback();
        };
        $scope.$on('$destroy', function () {
            $scope.imagePreviewModal.remove();
        });

        return imagePreviewModal;
    };
    return {
        initModal: initModal
    }
}]);

// 分享

app.factory('ShareModal', ['$rootScope', 'getInterface', 'userInfo', 'Authentication', '$ionicModal', function ($rootScope, getInterface, userInfo, Authentication, $ionicModal) {
    var initModal = function ($scope) {
        var shareModal = $ionicModal.fromTemplateUrl('apps/templates/share.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (shareModal) {
            $scope.shareModal = shareModal;
            return shareModal;
        });
        $scope.openShareModal = function () {
            $scope.shareModal.show();
        };
        $scope.closeShareModal = function () {
            $scope.shareModal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.shareModal.remove();
        });

        return shareModal;
    };
    return {
        initModal: initModal
    }
}]);

app.directive('backButton', function () {
    return {
        restrict: 'A',

        link: function (scope, element, attrs) {
            element.bind('click', goBack);

            function goBack() {
                history.back();
                scope.$apply();
            }
        }
    }
});

//新窗口显示图片
//image-preview="1.jpg"
app.directive('imagePreview', function ($rootScope, $state, $ionicPlatform, QyWechat) {
    return {
        restrict: 'A',
        //templateUrl: 'apps/templates/image-preview.html',
        link: function (scope, element, attrs) {
            element.bind('click', goBack);

            function goBack() {
                var index = parseInt(attrs.index);
                var pid = attrs.imagePreview;
                var multiple = attrs.multiple;
                var imgs
                if (attrs.multiple == 'true' || attrs.multiple == 'list') {
                    imgs = attrs.imagePreview;
                } else {
                    imgs = '';
                }
                $state.go('image-preview', {
                    index: index,
                    pid: pid,
                    multiple: multiple,
                    src: imgs
                });

            }
        }
    }
});

//按比例缩放图片或元素
//ratio-scale="2:1"
app.directive('ratioScale', function ($rootScope, $state, $timeout, $ionicPlatform) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            //$ionicPlatform.ready(function () {
            //angular.element(document).ready(function() {
            scope.$watch('$viewContentLoaded', function () {
                $timeout(function () {
                    var ratio = attrs.ratioScale.split(':');
                    //if (element[0].id) alert(element[0].id+':'+element[0].offsetWidth)
                    var height = parseInt(element[0].offsetWidth) / (ratio[0] / ratio[1]);
                    //alert(parseInt(element[0].offsetWidth))
                    element[0].style.height = height + 'px';
                    //element.css("height", height+'px');
                }, 50);

            });

        }
    }
});

//无数据提示
app.directive('moboNoData', function ($rootScope, $state, $http) {
    return {
        restrict: 'E',
        templateUrl: 'apps/templates/no-data.html',
        scope: {
            icon: '@icon',
            text: '@text',
            layout: '@layout',
            style: '@style',
        }
    }
});
//数据加载中动画
app.directive('moboDataLoading', function ($rootScope, $state, $http) {
    return {
        restrict: 'E',
        templateUrl: 'apps/templates/data-loading.html',
        scope: {
            icon: '@icon',
            text: '@text',
            layout: '@layout',
            style: '@style',
        }
    }
});
//启动背景图
app.factory('StartPage', function ($ionicModal) {
    var initModal = function ($scope) {
        var modal = $ionicModal.fromTemplate('<div class=""></div>', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            return modal;
        });
        $scope.openStartPageModal = function () {
            $scope.getEnterprises(function () {
                $scope.modal.show();
            })

        };
        $scope.closeStartPageModal = function () {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        return modal;
    };
    return {
        initModal: initModal
    }
});
//通用文件上传
app.service('Util', function ($q) {
    var dataURItoBlob = function (dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {
            type: mimeString
        });
    };

    var compressImage = function (data, config, callback) {
        config = angular.extend({
            maxWidth: 1280,
            maxHeight: 1280,
            toString: true
        }, (config || {}));
        var sMime = 'png';
        if (window.gIsAndroid && data.indexOf("data:image/") != 0) {
            //alert()
            sMime = sName.split(".").pop().toLowerCase();
            data = data.replace("base64,", "image/" + sMime + ";base64,");
        }
        var img = new Image();
        img.onload = function () {
            //resize the image using canvas
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var MAX_WIDTH = config.maxWidth;
            var MAX_HEIGHT = config.maxHeight;
            var width = img.width;
            var height = img.height;
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            //change the dataUrl to blob data for uploading to server
            var dataURL = canvas.toDataURL('image/' + sMime, config.ratio || 1);

            var blob = config.toString ? dataURL : dataURItoBlob(dataURL);
            img = null;
            ctx = null;
            canvas = null;
            callback && callback(blob);
        }
        img.src = data;
    }

    var resizeFile = function (file, config, callbackFunction) {

        //var deferred = $q.defer();
        try {
            var reader = new FileReader();
            reader.onload = function (e) {

                //img.src = e.target.result;
                //config.name = name.name;
                compressImage(e.target.result, config, function (blob) {
                    callbackFunction(blob);
                });
            };
            reader.readAsDataURL(file);
        } catch (e) {
            alert('error')
            callbackFunction(e);
        }
        //return deferred.promise;

    };
    return {
        resizeFile: resizeFile,
        compressImage: compressImage
    };

});
app.factory('QyWechat', function ($http, $location, $ionicPlatform, $filter, Xalert) {
    var signature = function (callback) {
        if ($ionicPlatform.isWechat) {
            //url = url || $location.absUrl();

            //alert(window.location.href);
            //wx.ready(function () {
            $http({
                url: 'index.php/wechat/jssign',
                method: 'POST',
                cache: false,
                data: {
                    eid: 0,
                    url: $location.absUrl()
                },
                //timeout: 1000 * 30
            }).success(function (data, status, header, config) {
                //alert(angular.toJson(data));
                wx.config({
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: [
                        'checkJsApi',
                        'chooseImage',
                        'previewImage',
                        'uploadImage',
                        'downloadImage',
                        'scanQRCode',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                        'showAllNonBaseMenuItem',
                        'hideAllNonBaseMenuItem',
                        'showMenuItems',
                        'hideMenuItems'
                    ]
                });

                callback && callback();

            }).error(function (data, status, header, config) {
                Xalert.loading(data);
            });
            //});
        }

    };
    //init();
    return {
        init: signature,
        //相册图片预览
        previewImage: function (current, urls) {
            signature(function () {
                angular.forEach(urls, function (rows, index) {
                    urls[index] = $filter('thumbImage')(rows, 800);
                });
                wx.previewImage({
                    current: $filter('thumbImage')(current, 800), // 当前显示图片的http链接
                    urls: urls // 需要预览的图片http链接列表
                });
            });
        },
        //选择相机或拍照
        chooseImage: function (config, callback) {
            signature(function () {
                wx.ready(function () {
                    wx.chooseImage({
                        count: config.count || 9, // 默认9
                        sizeType: config.sizeType || ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                        sourceType: config.sourceType || ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                        success: function (res) {

                            var i = 0,
                                length = res.localIds.length;

                            var serverId = [];

                            function upload() {
                                var localId = res.localIds[i];
                                wx.uploadImage({
                                    localId: localId,
                                    success: function (results) {
                                        i++;
                                        //alert('已上传：' + i + '/' + length);
                                        //alert(results.serverId.length)
                                        serverId.push({
                                            serverId: results.serverId,
                                            localId: localId
                                        });

                                        if (i < length) {
                                            upload();
                                        } else {
                                            callback(serverId);
                                        }
                                    },
                                    fail: function (res) {
                                        alert(JSON.stringify(res));
                                    }
                                });
                            }

                            upload();
                            //alert(res.length)
                            //callback && callback(res.localIds);
                        }
                    });
                });
            });

        },
        //上传到微信服务器
        uploadImage: function (res, callback) {
            var i = 0,
                length = res.length;
            var serverId = [];

            function upload() {
                var localId = res[i];
                wx.uploadImage({
                    localId: localId,
                    success: function (results) {
                        i++;
                        alert('已上传：' + i + '/' + length);
                        serverId.push(results.serverId);

                        if (i < length) {
                            upload();
                        } else {
                            callback(serverId);
                        }
                    },
                    fail: function (res) {
                        alert(JSON.stringify(res));
                    }
                });
            }

            upload();
        },
        //扫码
        scanQRCode: function (config, callback) {
            //signature(function () {
            wx.scanQRCode({
                needResult: config.needResult || 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: config.scanType || ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function (res) {
                    callback(res.resultStr); // 当needResult 为 1 时，扫码返回的结果
                }
            });
            //});
        },
        //获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
        shareTimeLine: function (config, successCallback, cancelCallback) {
            wx.onMenuShareTimeline({
                title: config.title, // 分享标题
                link: config.link, // 分享链接
                imgUrl: config.imgUrl, // 分享图标
                success: function () {
                    successCallback && successCallback();
                },
                cancel: function () {
                    cancelCallback && cancelCallback();

                }
            });

        },
        //获取“分享给朋友”按钮点击状态及自定义分享内容接口
        shareAppMessage: function (config, successCallback, cancelCallback) {
            wx.onMenuShareAppMessage({
                title: config.title, // 分享标题
                desc: config.desc || '', // 分享描述
                link: config.link || '', // 分享链接
                imgUrl: config.imgUrl || '', // 分享图标
                type: config.type || '', // 分享类型,music、video或link，不填默认为link
                dataUrl: config.dataUrl || '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    successCallback && successCallback();
                },
                cancel: function () {
                    cancelCallback && cancelCallback();
                }
            });

        },
        //获取“分享到QQ”按钮点击状态及自定义分享内容接口
        shareQQ: function (config, successCallback, cancelCallback) {
            wx.onMenuShareQQ({
                title: config.title, // 分享标题
                desc: config.desc || '', // 分享描述
                link: config.link || '', // 分享链接
                imgUrl: config.imgUrl || '', // 分享图标
                success: function () {
                    successCallback && successCallback();
                },
                cancel: function () {
                    cancelCallback && cancelCallback();
                }
            });

        },
        //获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口
        shareWeibo: function (config, successCallback, cancelCallback) {
            wx.onMenuShareWeibo({
                title: config.title, // 分享标题
                desc: config.desc || '', // 分享描述
                link: config.link || '', // 分享链接
                imgUrl: config.imgUrl || '', // 分享图标
                success: function () {
                    successCallback && successCallback();
                },
                cancel: function () {
                    cancelCallback && cancelCallback();
                }
            });

        },
        //获取“分享到QQ空间”按钮点击状态及自定义分享内容接口
        shareQZone: function (config, successCallback, cancelCallback) {
            wx.onMenuShareQZone({
                title: config.title, // 分享标题
                desc: config.desc || '', // 分享描述
                link: config.link || '', // 分享链接
                imgUrl: config.imgUrl || '', // 分享图标
                success: function () {
                    successCallback && successCallback();
                },
                cancel: function () {
                    cancelCallback && cancelCallback();
                }
            });

        },
        //显示所有功能按钮接口
        showAllNonBaseMenuItem: function () {
            wx.showAllNonBaseMenuItem();
        },
        //隐藏所有非基础按钮接口
        hideAllNonBaseMenuItem: function () {
            wx.hideAllNonBaseMenuItem();
        },

        //批量显示功能按钮接口
        showMenuItems: function (menuList) {
            wx.showMenuItems({
                menuList: menuList || [] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
            });
        },
        //批量显示功能按钮接口
        hideMenuItems: function (menuList) {
            wx.hideMenuItems({
                menuList: menuList || ["menuItem:originPage", "menuItem:openWithQQBrowser", "menuItem:copyUrl", "menuItem:openWithSafari", "menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:share:facebook", "menuItem:share:QZone"] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
            });
        }
    }
});
//微信分享菜单和分享内容设置
app.factory('WechatShare', ['$ionicPlatform', 'QyWechat', function ($ionicPlatform, QyWechat) {
    return {
        setting: function (isshare, config, successCallback, cancelCallback) {
            if ($ionicPlatform.isWechat) {
                if (isshare == '1') {
                    wx.showAllNonBaseMenuItem();
                    QyWechat.init(function () {
                        QyWechat.shareTimeLine(config, successCallback, cancelCallback); //朋友圈
                        QyWechat.shareAppMessage(config, successCallback, cancelCallback); //朋友
                        QyWechat.shareQQ(config, successCallback, cancelCallback); //QQ
                        QyWechat.shareWeibo(config, successCallback, cancelCallback); //微
                        QyWechat.shareQZone(config, successCallback, cancelCallback); //QQ空间
                    })
                    //});
                } else {
                    QyWechat.init(function () {
                        QyWechat.hideMenuItems();
                    });
                }
            }
        },
    }
}]);

//提醒信息弹窗
app.factory('Xalert', ['$ionicLoading', function ($ionicLoading) {
    return {
        loading: function (text, time) {
            $ionicLoading.show({
                template: text,
                duration: time == undefined ? 1500 : time,
                noBackdrop: true,
            });
        },
        remind: function (text, time) {
            $ionicLoading.show({
                cssClass: 'teacher-order-popup',
                content: 'ssss',
                template: '<ion-spinner icon="ios"></ion-spinner>',
                duration: time == undefined ? 2000 : time,
                noBackdrop: false,
            });
        },
        close: function () {
            $ionicLoading.hide();
        }
    }
}]);

/*周几*/
app.filter('week', function () {
    return function (value) {
        if (!value) return '';
        var newDate = new Date();
        newDate.setTime(parseInt(value));
        var a = new Array("日", "一", "二", "三", "四", "五", "六");
        var week = new Date(newDate.toISOString()).getDay();
        return a[week];
    };
});
/*月份*/
app.filter('month', function () {
    return function (value) {
        if (!value) return '';
        var newDate = new Date();
        newDate.setTime(parseInt(value));
        var month = new Date(newDate.toISOString()).getMonth() + 1;
        return month;
    };
});
/*天*/
app.filter('pridate', function () {
    return function (value) {
        if (!value) return '';
        var newDate = new Date();
        newDate.setTime(parseInt(value));
        var date = new Date(newDate.toISOString()).getDate();
        return date;
    };
});

/*数字超过最大限制 如99+*/
app.filter('countMax', function () {
    return function (value, max, tail) {
        if (!value) return '';
        value = parseInt(value);
        if (!value) return value;
        if (value > parseInt(max)) {
            value = max + (tail || '');
        }
        return value;
    };
});
//{{ excellentCourse.courseName | cut:true:10:' ...'}}  or ng-bind="taskcourseList.courseName  | countMax:999:'+'"    //页面里边使用方式
/*截取字符串长度 end*/

/*星星数+*/
app.filter('star', function () {
    return function (value) {
        if (!value) return '';
        var number = value;
        value = value.split('.');
        if (parseInt(value[1]) != 5) {
            number = Math.round(number);
        }
        return number;
    };
});

/*缩略图+*/
app.filter('thumbImage', function () {
    return function (value, width) {
        if (!value) return '';
        if (width) {
            if (value.indexOf('_thumb_') != -1) {
                value = value.replace(/_thumb_(\d+)(\.[jpg|png|gif|bmp|jpeg]+)/, '');
            }
            value += '_thumb_' + width + value.substring(value.lastIndexOf('.'));
        }
        return value;
    };
});

/*多语言*/
app.filter('i18n', ['languages', '$i18n', '$rootScope', function (languages, $i18n, $rootScope) {
    return function (value, key) {
        if (!value) return '';
        //$i18n.getBooks(function(language){
        var res = languages[value] || '';
        return key ? res[key] || '' : res;
        //});

    };
}]);

//图片基地址
app.filter('baseUrl', function () {
    return function (value) {
        var url;
        if (!value) return url = '';
        if (document.domain.indexOf('duoke.mobi') != -1) {
            url = 'http://duoke.mobi/api/'; //正式
        } else if (document.domain.indexOf('mdk.moxueyuan.net') != -1) {
            url = 'http://mdk.moxueyuan.net/'; //准生产
        } else {
            url = 'http://fashionme.test.chinamobo.com/'; //测试
        }
        if (value) {
            url += value;
        }
        return url;
    };
});
/*
 value : 预约时间 （时间戳）
 min :服务时间（例如，120分钟）单位分钟
 exeTime : 额外服务时间(120分钟) 单位分钟
 */
app.filter('timeSelf', function () {
    return function (value, min, exeTime) {
        value = Math.floor(value) * 1000; //预约时间戳
        min = Math.floor(min) * 60 * 1000; //所选服务时间戳

        var toDub = function (n) {
            return n < 10 ? '0' + n : '' + n;
        };
        if (exeTime) { //如果有额外服务时间
            exeTime = Math.floor(exeTime) * 60 * 1000;
            ; //额外服务时间戳
            var oDate = new Date(value + min + exeTime); //终止时间对象
        } else {
            var oDate = new Date(value + min); //终止时间对象
        }
        var oDateStart = new Date(value) //预约时间对象

        var mon = toDub((oDateStart.getMonth() + 1)); //预约时间的月
        var date = toDub(oDateStart.getDate()); //预约时间的日
        var h = toDub(oDateStart.getHours()); //预约时间的时
        var s = oDateStart.getMinutes() == 0 ? '00' : toDub(oDateStart.getMinutes())
        var starTime = oDateStart.getFullYear() + '-' + mon + '-' + date + '  ' + h + ':' + s; //分钟

        var endTime = toDub(oDate.getHours()) + ':' + (oDate.getMinutes() == 0 ? '00' : toDub(oDate.getMinutes()));
        return starTime + '至' + endTime;
    };
});

//键值列表
//app.factory('AppsetValue', ['getInterface', '$http', 'ENV', '$cookies', function(getInterface, $http, ENV, $cookies) {
//	var factory = {};
//	factory.loadCompany = function(defer) {
//		var company_id = $cookies.get('company_id');
//		if(!company_id) { //测试用，写死
//			company_id = "f00dfde1_4119_5556_b9e8_47174d7a55a9";
//		}
//		var nowTime = new Date().getTime() / 1000;
//		var baseUrl = ENV.apiurl + 'FM_APP_SET_VALUE&jsonpcallback=angular.callbacks._0&user_id=&token=&device_type=wechat&language=zh_CN&version=3.0&company_id=' + company_id + '&time_stamp=' + nowTime + '&value_md5=';
//		$http.jsonp(baseUrl)
//			.success(
//				function(results, status, header, config) {
//					if(results.status == 'Y') {
//						defer.resolve(results);
//					}
//				}
//			)
//			.error(
//				function(data) {
//
//				}
//			);
//	}
//	return factory;
//}]);

//键值列表
app.factory('AppsetValue', ['getInterface', '$http', 'ENV', '$cookies', function (getInterface, $http, ENV, $cookies) {
    var factory = {};
    factory.loadCompany = function (defer) {
        var company_id = $cookies.get('company_id');
        if (!company_id) { //测试用，写死
            company_id = "f00dfde1_4119_5556_b9e8_47174d7a55a9";
        }
        var nowTime = new Date().getTime() / 1000;
        var baseUrl = ENV.apiurl + 'FM_APP_SET_VALUE&jsonpcallback=angular.callbacks._0&user_id=&token=&device_type=wechat&language=zh_CN&version=3.0&company_id=' + company_id + '&time_stamp=' + nowTime + '&value_md5=';
        $http.jsonp(baseUrl)
            .success(
                function (results, status, header, config) {
                    if (results.status == 'Y') {
                        defer.resolve(results);
                    }
                }
            )
            .error(
                function (data) {

                }
            );
    }
    return factory;
}]);