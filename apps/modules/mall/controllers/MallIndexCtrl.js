'use strict';
/*商城
 author huoyuanyuan
 */
app.controller('MallIndexCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicSlideBoxDelegate, $ionicPopup, sourseChange) {
    //商品列表
    $scope.isNoData = false;//false：不显示无数据布局；true：显示无数据布局
    $scope.canLoadMore = true;//可以显示加载更多动画
    $scope.isShowLoadMore = true;//是否显示加载更多动画（都等于true时才显示）
    $scope.page = 1;
    $scope.items = [];//商品列表
    var n = 0;
    $scope.producttypeId = ''; //分类Id
    $scope.sortid = 0;
    $scope.activeItemc = ''; //分类样式
    var isBorder = $scope.sortid; // 保存actice项
    var aSpan = document.getElementById('tsb-hscroll').getElementsByClassName('scroll')[0].getElementsByTagName('span');
    $scope.categoryOrder = function (sortid) {

        // if ($scope.sortid == sortid) {
        //     return;
        // }
        $scope.sortid = sortid;
        isBorder = sortid;
        $ionicScrollDelegate.scrollTop();

        /****************切换标签时重置数据******************/
        $scope.canLoadMore = true;//显示点点点
        $scope.isShowLoadMore = true;//显示点点点
        $scope.items = [];
        $scope.page = 1;
        $scope.isNoData = false;//不显示无数据界面
        /****************切换标签时重置数据******************/

        if ($scope.sortid == 1) {
            if (!$scope.isShow) {//价格
                $scope.isUp = !$scope.isUp;
                $scope.isDown = !$scope.isUp;
                if ($scope.isUp) {
                    $scope.orderPriceMode = 'ORDER_ASC'; //正序 [低-高]
                }
                if ($scope.isDown) {
                    $scope.orderPriceMode = 'ORDER_DESC'; //倒序 【高-低】
                }
            }
            $scope.orderType = 'ORDER_PRICE'; //价格
        } else if ($scope.sortid == 2) {//好评率
            $scope.orderType = 'ORDER_COMMENT'; //好评
            $scope.orderPriceMode = '';
            $scope.isUp = false;
            $scope.isDown = false;
        } else {//销量
            $scope.orderType = 'ORDER_SALESVOLUME'; //销量
            $scope.orderPriceMode = '';
            $scope.isUp = false;
            $scope.isDown = false;
        }

        loadData();

    };
    //商城列表接口
    var loadData = function () {
        var options = {
            data: $scope.items,
            module: 'FM_SHOP_PRODUCT_LIST',
            params: {
                current_page: $scope.page,
                page_size: 10,
                product_ordertype: $scope.orderType, //销量，价格，好评
                product_ordermode: $scope.orderPriceMode, //倒/正序
                producttype_id: $scope.producttypeId //分类Id
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                $scope.counts = results.counts;
                $scope.items = params.data;

                /*判断隐藏上拉刷新*/
                if (results.results.length < 10) {
                    $scope.canLoadMore = false;
                    $scope.isShowLoadMore = false;
                } else {
                    $scope.canLoadMore = true;
                    $scope.isShowLoadMore = true;
                }
                /*设置isNoData值,用于判断是否显示无数据视图*/
                $scope.items.length == 0 ? $scope.isNoData = true : $scope.isNoData = false;
                setTimeout(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, 1000);

            } else {
                $scope.isNoData = true;
                $scope.canLoadMore = false;
                Xalert.loading(results.error_msg, 1000);
                return false;
            }
        });
    }
    $scope.categoryOrder($scope.sortid);
    //上拉加载
    $scope.loadMoreGoodsList = function () {
        $scope.isShowLoadMore = true;
        $timeout(function () {
            $scope.page = $scope.page + 1;
            loadData();
        }, 1000);
    };
    //下拉刷新
    $scope.doRefresh = function () {
        $scope.page = 1;
        $scope.canLoadMore = true;//合起来不显示点点点
        $scope.isShowLoadMore = false;//合起来不显示点点点
        $timeout(function () {
            $scope.items = [];
            loadData();
            $scope.$broadcast('scroll.refreshComplete');
        }, 500);
    };

    //分类
    var loadProType = function () {
        var options = {
            data: $scope.itemsType,
            module: 'FM_SHOP_PRODUCT_ONE_LEVEL_LIST',
            params: {}
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.itemsType = results.results;
            }
        });
    }
    loadProType();
    //点击分类
    var removePopup;
    var bFlag = false;
    $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (bFlag) {
            removePopup.close();
        }

    });
    $scope.proType = function () {
        bFlag = true;
        if (aSpan) {
            if (document.getElementsByClassName('backdrop')[0]) {
                document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active backdropSelf';
            }
            angular.forEach(aSpan, function (value, index) {
                value.className = 'disable-user-behavior';
            })
        }
        $scope.isShow = !$scope.isShow;
        removePopup = $ionicPopup.show({
            cssClass: 'mall',
            templateUrl: 'apps/modules/mall/templates/goods-type.html',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    $scope.isShow = !$scope.isShow;
                    $scope.sortid = isBorder;
                    if (aSpan[isBorder]) {
                        aSpan[isBorder].className = 'disable-user-behavior active';
                    }
                    if (document.getElementsByClassName('backdrop')[0]) {
                        document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active ';
                    }
                    bFlag = false;
                }
            },
                {
                    text: '<font color="#333">确定</font>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.items = [];
                        if (aSpan[isBorder]) {
                            aSpan[isBorder].className = 'disable-user-behavior active';
                        }
                        if (document.getElementsByClassName('backdrop')[0]) {
                            document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active ';
                        }
                        $scope.categoryOrder($scope.sortid);
                        $scope.isShow = !$scope.isShow;
                        bFlag = false;
                    }
                }
            ]
        })
    }
    //分类-con
    $scope.proTypeItem = function (producttype_id, name) {
        $scope.activeItemc = producttype_id;
        if (name != '全部') {
            $scope.producttypeId = producttype_id;
        } else {
            $scope.producttypeId = '';
        }
    };

    //搜索
    $scope.searchText = {text: ''};
    $scope.search = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e.keyCode == 13) {
            if ($scope.searchText.text) {
            	var timestamp = Date.parse(new Date()) + '';
                $state.go('mall-search',{timestamp: timestamp});
                sessionStorage.searchCon = $scope.searchText.text;
                $scope.searchText = {text: ''};
            } else {
                Xalert.loading('亲，请输入要搜索的内容');
            }

        }
    };
    //商品收藏
    $scope.goodsCollection = function (item) {
        sourseChange.collection(item.product_id, function (results) {
            if (results.status == 'Y') {
                if (item.iscollection == 'N') {
                    item.iscollection = 'Y';
                    return;
                } else {
                    Xalert.loading('亲，您已经收藏');
                    return;
                }
            }
        });
    };
    //商品取消收藏
    $scope.goodsCollectionDel = function (item) {
        sourseChange.uncollection(item.product_id, function (results) {
            if (results.status == 'Y') {
                if (item.iscollection == 'Y') {
                    item.iscollection = 'N';
                    return;
                } else {
                    Xalert.loading('亲，您已经收藏');
                    return;
                }
            }
        });
    };

    //跳转商品详情
    $scope.goGoodsDetail = function (id) {
        localStorage.setItem('historyPageNum','1');
        $state.go('mall-detail', {id: id, timestamp: String(Date.parse(new Date()))});
    }

    //刷新商品列表
    $rootScope.$on('refreshGoodsList', function (event, data) {
        $ionicScrollDelegate.scrollTop();
        $scope.doRefresh();
    });

});