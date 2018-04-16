'use strict';
/*购物车
 author huoyuanyuan
 */
app.controller('CarIndexCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicPopup, pageData, userInfo, $location) {
    //购物车列表
    //item.$selected //选中状态 true 选中  false 未选中
    $scope.total = 0; //商品总数
    $scope.prices = 0; //商品总价
    $scope.isNoData = false;//购物车列表数量为0
    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }

    $scope.noClick = {pointerEvents: 'none'}; //无货
    //购物车列表接口
    var loadData = function () {
        var options = {
            module: 'FM_SHOP_CART_LIST',
            params: {}
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.items = results.results;
                //购物车列表数量为0,无数据图显示
                if (results.counts == 0) {
                    $scope.isNoData = true;
                }
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }
    loadData();

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'mall-detail') {
            event.preventDefault();
            loadData();
        }
    });
    //复选框（选择商品）
    $scope.checkShop = function (item, $event) {
        $event.stopPropagation();
        if (item.isgoods == '1' && item.issale == '0') {//库存充足&&上架
            item.$selected = !item.$selected;
            if (item.$selected) {
                $scope.total += parseFloat(item.num);
                $scope.prices += parseFloat(item.price) * parseFloat(item.num);
                item.bFlag = true;
            } else {
                $scope.total -= parseFloat(item.num);
                $scope.prices -= parseFloat(item.price) * parseFloat(item.num);
                item.bFlag = false;
            }
        }
    };
    //编辑按钮
    $scope.editor = function (item, $event) {
        $event.stopPropagation();
        angular.forEach($scope.items, function (value, index) {
            value.$isShow = false;
        });
        item.$isShow = true;
        if (item.issale == '0') {
            if (item.issale == '1' || item.isgoods == '2' || item.isgoods == '0') { //下架或者不足或者无货
                item.$selected = false; //选中状态 true 选中  false 未选中
            } else {
                item.$selected = true;
            }
            //如果没有点击复选框并且充足，直接点击编辑时的操作,再次点击该商品的时候不作运算
            if (!item.bFlag && item.isgoods == '1') {
                item.bFlag = !item.bFlag;
                if (item.$selected) {
                    $scope.total += parseFloat(item.num);
                    $scope.prices += parseFloat(item.price) * parseFloat(item.num);
                } else {
                    $scope.total -= parseFloat(item.num);
                    $scope.prices -= parseFloat(item.price) * parseFloat(item.num);
                }
            }
        }

    };
    //编辑-添加商品
    var isAdding = false;//正在添加商品
    $scope.addProduct = function (item, $event) {
        if((item.isgoods == '0')||(item.isgoods == '2')||(item.issale == '1')){//无货or不足or下架
            Xalert.loading('产品库存不足!',1000);
            return;
        }
        if (isAdding) {
            return;
        }
        isAdding = true;
        $event.stopPropagation();
        $scope.isHidden = {pointerEvents: 'auto'};
        var loadData = function () {
            var options = {
                module: 'FM_SHOP_CART_UPDATE',
                params: {
                    product_id: item.product_id,
                    or_count: item.num * 1 + 1,
                    pproid: item.pproid,
                    scid: item.scid,
                    action: 'add'
                }
            };
            getInterface.jsonp(options, function (results) {
                if (results.status == 'Y') {
                    item.$selected = true;//使商品处于选中状态时
                    item.num = parseInt(item.num) + 1;//更新该商品的数量
                    $scope.total++;//总数量加1
                    $scope.prices += parseFloat(item.price);//总实付款加上商品价格
                } else {
                    Xalert.loading(results.error_msg, 1000);
                }
                isAdding = false;
            });
        }
        loadData();

    };
    //编辑-减少商品
    var isReducing = false;//正在减少商品
    $scope.delProduct = function (item, $event) {

        if((item.isgoods == '0')||(item.issale == '1') || (parseInt(item.num) == 1)){//无货or下架
            $scope.isHidden = {pointerEvents: 'none'};
            return;
        }

        if (isReducing) {
            return;
        }
        isReducing = true;
        $event.stopPropagation();
        // 减少商品
        var loadData = function () {
            var options = {
                module: 'FM_SHOP_CART_UPDATE',
                params: {
                    product_id: item.product_id,
                    or_count: item.num * 1 - 1,
                    pproid: item.pproid,
                    scid: item.scid,
                    action: 'subtract'
                }
            };
            getInterface.jsonp(options, function (results) {
                if (results.status == 'Y') {
                    item.$selected = true;//使商品处于选中状态时
                    item.num = parseInt(item.num) - 1;//更新该商品的数量
                    $scope.total--;//总数量减1
                    $scope.prices -= parseFloat(item.price);//总实付款减去商品价格
                } else {
                    Xalert.loading(results.error_msg);
                }
                isReducing = false;
            });
        }
        loadData();
    };
    //编辑-删除商品
    var bFlag = false;
    var removePopup;
    $scope.$on('$stateChangeStart', function (event, toState, fromState) {
        if (bFlag) {
            removePopup.close();
        }
    });
    $scope.editorDel = function (index, item, $event) {
        $event.stopPropagation();
        bFlag = true;
        removePopup = $ionicPopup.show({
            template: '<p style="margin: 2em 0; text-align: center">亲，您确定要删除当前商品吗？</p>',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    bFlag = false
                }
            },
                {
                    text: '<font color="#E64C65">确定</font>',
                    type: 'button-positive',
                    onTap: function (e) {
                        var loadData = function () {
                            var options = {

                                module: 'FM_SHOP_CART_DELETE',
                                params: {
                                    scid: item.scid,
                                }
                            };
                            getInterface.jsonp(options, function (results) {
                                if (results.status == 'Y') {
                                    $scope.delPrices = parseFloat($scope.items[index].price) * parseFloat($scope.items[index].num); //删除商品的价格
                                    $scope.delNum = parseFloat($scope.items[index].num); //删除商品的数量
                                    $scope.items.splice(index, 1);
                                    if (item.issale == '0') {//上架
                                        $scope.prices -= $scope.delPrices;
                                        $scope.total -= $scope.delNum;
                                    }
                                    if ($scope.items.length == 0) {
                                        $scope.isNoData = true;
                                    }
                                } else {
                                    Xalert.loading(results.error_msg);
                                }
                            });
                        };
                        loadData();
                        bFlag = false
                    }
                }
            ]
        })

    };
    //编辑-确定
    $scope.editorSure = function (index, item, $event) {
        $event.stopPropagation();
        $scope.items[index].$isShow = false;
    };

    //下架点击加减无反应
    $scope.noResponse = function ($event) {
        $event.stopPropagation();
    }

    //跳转商品详情
    $scope.goGoodsDetail = function (id) {
        $state.go('mall-detail', {id: id, timestamp: String(Date.parse(new Date()))});
    }

    //计算商品价格和数量
    $scope.sum = function () {
        $scope.prices = 0;
        $scope.total = 0;
        angular.forEach($scope.items, function (value, index, array) {
            if (value.isgoods == '1' && value.issale == '0') {
                $scope.prices += parseFloat(value.price) * parseFloat(value.num);
                $scope.total += parseFloat(value.num);
            }
        });
    };
    //全选
    $scope.allSelect = function () {
        if ($scope.items.length > 0) {
            $scope.selectedAll = !$scope.selectedAll;
            if ($scope.selectedAll) {
                angular.forEach($scope.items, function (value, index) {
                    if (value.isgoods == '1' && value.issale == '0') {
                        value.$selected = true;
                        value.bFlag = true;
                    } else {
                        value.$selected = false;
                    }

                });
                $scope.sum()
            } else {
                angular.forEach($scope.items, function (value, index) {
                    value.$selected = false;
                    value.bFlag = false;
                });
                $scope.prices = 0;
                $scope.total = 0;
            }
        }

    };
    //由去支付界面返回，清空选中数据
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'my-submit') {
            event.preventDefault();
        }
    });
    //去支付
    $scope.toPay = function () {
        var selectedData = [];
        angular.forEach($scope.items, function (value, index) {
            if (value.$selected) {
                selectedData.push(value);
            }
        });
        localStorage.setItem('cartSelectedData', angular.toJson(selectedData));//选中的商品
        if (selectedData.length > 0) {
            localStorage.removeItem('alreadyPaid');//进入的时候清空
            $state.go('my-submit');
        } else {
            Xalert.loading('请选择购买商品', 1000);
        }
    }

});