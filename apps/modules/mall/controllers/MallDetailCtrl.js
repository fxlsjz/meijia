'use strict';
/*商品详情
 author caixiaojuan
 */
/*商品*/
app.controller('MallDetailCtrl', function ($rootScope, $scope, $ionicPlatform, $stateParams, $ionicSlideBoxDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicPopup, $sce, $ionicScrollDelegate) {
    var product_id = $stateParams.id;
    $scope.detailtitles = [{
        "title": "商品"
    }, {
        "title": "详情"
    }, {
        "title": "评价"
    }]

    //返回上一页
    $scope.goBackList = function () {
        window.history.go(-1); //返回商品列表
    }
    //标签点击
    $scope.typeId = '1';
    $scope.showPageMall = true; //第一页
    $scope.selType = function (index) {
        $scope.typeId = index;
        $ionicScrollDelegate.scrollTop();
        if ($scope.typeId == '1') { //显示第一页
            $scope.showPageMall = true;
            $scope.showPageDetail = false;
            $scope.showEvaluate = false;

        } else if ($scope.typeId == '2') { //显示第二页
            $scope.showPageDetail = true;
            $scope.showPageMall = false;
            $scope.showEvaluate = false;
        } else if ($scope.typeId == '3') { //显示第三页
            $scope.showPageDetail = false;
            $scope.showPageMall = false;
            $scope.showEvaluate = true;
        }
    }

    var options = {};
    /*商品详情接口*/
    var loadData = function () {

        options = {
            page: false,
            module: 'FM_SHOP_PRODUCT_INFO',
            params: {
                product_id: product_id
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                $scope.shopDetails = results.results;
                $scope.shopNum = $scope.shopDetails.cart_count;
                $scope.shopEvaluaList = $scope.shopDetails.product_comment;
                for (var i = 0; i < $scope.shopEvaluaList.length; i++) {
                    if ($scope.shopEvaluaList[i].isanonymity == 1) {
                        $scope.shopEvaluaList[i].isAnonysMity = '匿名';
                    } else {
                        $scope.shopEvaluaList[i].isAnonysMity = $scope.shopEvaluaList[i].uname;
                    }
                }
                /*if($scope.shopNum > 99){
                 $scope.shopNum = '99+';
                 }*/
                $scope.goodsOut = true; //规格栏显示
                /*下架的显示情况*/
                if ($scope.shopDetails.issale == 1) {
                    $scope.formatClick = {
                        display: 'none'
                    };
                    $scope.noAdd = {
                        pointerEvents: 'none'
                    }
                    $scope.gray = {
                        color: '#dedede'
                    }
                    $scope.noCollect = {
                        pointerEvents: 'none'
                    };
                    $scope.goodsOut = false; //规格栏隐藏
                    $scope.noAdd = {
                        pointerEvents: 'none',
                        background: '#dedede'
                    };
                    $scope.displayNo = {
                        display: 'block'
                    };
                    $scope.gray = {
                        color: '#dedede'
                    }
                }
                /*默认显示*/
                $scope.productfid = $scope.shopDetails.product_format[0].fid;
                $scope.formatId = $scope.productfid;
                $scope.productImg = $scope.shopDetails.product_format[0].format_img;
                $scope.productPrice = $scope.shopDetails.product_format[0].price;
                $scope.productName = $scope.shopDetails.product_format[0].format_name;
                $scope.productdefault = $scope.shopDetails.product_format[0].isdefault;
                $scope.productIsstock = $scope.shopDetails.product_format[0].isstock;
                /*无货显示*/
                if ($scope.productIsstock == '0') {
                    $scope.noAdd = {
                        pointerEvents: 'none',
                        background: '#dedede'
                    };
                    $scope.displayNo = {
                        display: 'block'
                    };
                    $scope.gray = {
                        color: '#dedede'
                    }
                }
                if ($scope.productIsstock == '1') {
                    $scope.displayNo = {
                        display: 'none'
                    }
                }
                /*规格长度*/
                $scope.FormatLength = $scope.shopDetails.product_format.length;
                $scope.pImgs = $scope.shopDetails.pimg;
                $scope.shopCommentList = results.results.product_comment;
                /*规格集合*/
                $scope.formatName = [];
                for (var i = 0; i < $scope.FormatLength; i++) {
                    $scope.formatName.push({
                        formatid: $scope.shopDetails.product_format[i].fid,
                        formatname: $scope.shopDetails.product_format[i].format_name,
                        formatimg: $scope.shopDetails.product_format[i].format_img,
                        price: $scope.shopDetails.product_format[i].price,
                        isstock: $scope.shopDetails.product_format[i].isstock
                    });
                }
                /*轮播图显示*/
                $scope.imgcountall = $scope.pImgs.product_thumpath.length;
                $scope.imgcountallList = $scope.pImgs.product_thumpath; //图片遍历
                $scope.imgListore = []; //接口数据记录
                //当图片数量为2时 特殊处理
                if ($scope.pImgs.product_thumpath.length == 2) {
                    $scope.imgcountallList[2] = $scope.imgcountallList[0];
                    $scope.imgcountallList[3] = $scope.imgcountallList[1];
                    $scope.imgListore[0] = $scope.imgcountallList[0];
                    $scope.imgListore[1] = $scope.imgcountallList[1];
                }
                //				for(var i = 0; i < $scope.imgcountallList.length; i++) {
                //					$scope.imgcountallList.push($scope.imgcountallList[i])
                //				}

                $ionicSlideBoxDelegate.$getByHandle('rotateImg').update();
                $ionicSlideBoxDelegate.$getByHandle('rotateImg').loop(true);
                $ionicSlideBoxDelegate.$getByHandle('rotateImg').select(0);
                /*收藏*/
                if ($scope.shopDetails.iscollection == 'N') {
                    $scope.collIsNo = true;
                } else {
                    $scope.collIsNo = false;
                }
                //loadCarNum();
            }
        });
    }
    //	loadData();
    //滑动监听
    $scope.phoneNum = 1;
    $scope.changPage = function () {
        if ($scope.imgListore.length == 2) {
            //当图片数量为2时 特殊处理
            $scope.phoneNum = $ionicSlideBoxDelegate.$getByHandle('rotateImg').currentIndex() + 1;
            if ($ionicSlideBoxDelegate.$getByHandle('rotateImg').currentIndex() + 1 == 3) {
                $scope.phoneNum = 1;
            } else if ($ionicSlideBoxDelegate.$getByHandle('rotateImg').currentIndex() + 1 == 4) {
                $scope.phoneNum = 2;
            }
        } else {
            $scope.phoneNum = $ionicSlideBoxDelegate.$getByHandle('rotateImg').currentIndex() + 1;
        }

    }
    //	//商品图片滑动
    //	$scope.slideChang=function($event,index){
    ////		if(index!=$scope.imgcountall-1){
    //			$event.stopPropagation();
    ////		}
    //	}
    /*点击好评率 跳转评价选项卡 start*/
    //	$scope.evalSelect = function() {
    //		var slideselect = 2;
    //		$ionicSlideBoxDelegate.select(slideselect);
    //	}
    /*点击好评率 跳转评价选项卡 end*/
    /*弹窗*/
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        loadData();
    });
    var formatJson = {};
    $scope.format = function () {
        //loadData();
        var bFlag = false;
        var removePopup;
        $scope.$on('$stateChangeStart', function (event, toState, fromState) {
            if (bFlag) {
                removePopup.close();
            }
        });
        $scope.aFrame = function () {
            bFlag = true;
            formatJson = {
                cssClass: 'detail',
                templateUrl: 'apps/modules/mall/templates/shop-format.html',
                scope: $scope,
                buttons: [{
                    text: '<font color="#999">取消</font>',
                    type: 'button-default',
                    onTap: function () {
                        bFlag = false;
                        $scope.cancels($scope.productName);
                    }
                }, {
                    text: '<font color="#fff">加入购物车</font>',
                    type: 'button-positive',
                    onTap: function (e) {
                        bFlag = false;
                        $scope.addcar($scope.formatId, $scope.numbers);
                    }
                }]
            }
            removePopup = $ionicPopup.show(formatJson);
            if ($scope.productIsstock == '0') {
                formatJson.buttons[1].type = "button-positive noGoods";
            } else {
                formatJson.buttons[1].type = "button-positive";
            }
        }
        $scope.aFrame();
    }
    /*选择规格*/
    $scope.formatfun = function (format_id, format_name) {
        $scope.formatId = format_id;
        for (var i = 0; i < $scope.FormatLength; i++) {
            if ($scope.formatId == $scope.formatName[i].formatid) {
                $scope.productImg = $scope.formatName[i].formatimg;
                $scope.productPrice = $scope.formatName[i].price;
                $scope.productName = $scope.formatName[i].formatname;
                $scope.productIsstock = $scope.formatName[i].isstock;
                /*无库存*/
                if ($scope.productIsstock == '0') {
                    formatJson.buttons[1].type = "button-positive noGoods";
                    /*页面加入购物车按钮*/
                    $scope.noAdd = {
                        pointerEvents: 'none',
                        background: '#dedede'
                    };
                    /*规格旁边无货显示状态*/
                    $scope.gray = {
                        color: '#dedede'
                    }
                    $scope.displayNo = {
                        display: 'block'
                    };
                    return false;
                } else {
                    formatJson.buttons[1].type = "button-positive";
                    /*规格旁边无货显示状态*/
                    $scope.displayNo = {
                        display: 'none'
                    };
                    /*页面加入购物车按钮*/
                    $scope.noAdd = {
                        pointerEvents: 'auto',
                        background: '#e64c65'
                    };
                    $scope.gray = {
                        color: '#e64c65'
                    }
                }
            }
        }
    }
    /*数量默认值*/
    $scope.numbers = 1;
    /*增加数量*/
    $scope.addNum = function () {
        $scope.noPoint = {
            pointerEvents: 'auto'
        };
        $scope.numbers++;
    }
    /*减少数量*/
    $scope.cutNum = function () {
        if ($scope.numbers == 1) {
            $scope.noPoint = {
                pointerEvents: 'none'
            };
            return false;
        }
        $scope.numbers--;
    }
    /*取消按钮*/
    $scope.cancels = function (fName) {
        $scope.productName = fName;
    }
    /*加入购物车按钮*/
    $scope.addcar = function (fmid, fnum) {
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        var options = {};
        var loadAddCar = function () {
            options = {
                module: 'FM_SHOP_CART_ADD',
                params: {
                    product_id: product_id,
                    pproid: fmid,
                    num: fnum
                }
            };
            getInterface.jsonp(options, function (results) {
                if (results.status == 'Y') {
                    $scope.shopNum = $scope.shopNum + $scope.numbers;
                    Xalert.loading('加入购物车成功', 500);
                    return false;
                }
                if (results.status == 'N') {
                    Xalert.loading(results.error_msg, 1000);
                    return false;
                }
            });
        }
        loadAddCar();
    }
    //收藏取消收藏
    $scope.collIsNo = true;
    //收藏
    $scope.collIs = function () {

        //收藏操作，刷新商品列表
        $rootScope.$broadcast('refreshGoodsList');

        if (!Authentication.checkLogin(true)) {
            return false;
        } else {

            var loadData = function () {
                options = {
                    page: false,
                    module: 'FM_SHOP_COLLECT_PRODUCT',
                    params: {
                        product_id: product_id
                    }
                };
                getInterface.jsonp(options, function (results, params) {
                    if (results.status == 'Y') {
                        $scope.collIsNo = !$scope.collIsNo;
                    } else {
                        Xalert.loading(results.error_msg, 2000);
                    }
                });
            }
            loadData();
        }
        ;

    }
    //取消收藏
    $scope.collNo = function () {
        //收藏操作，刷新商品列表
        $rootScope.$broadcast('refreshGoodsList');
        if (!Authentication.checkLogin(true)) {
            return false;
        } else {
            $scope.collIsNo = !$scope.collIsNo;
            var loadData = function () {
                options = {
                    page: false,
                    module: 'FM_SHOP_CANCELCOLLECT_PRODUCT',
                    params: {
                        product_id: product_id
                    }
                };
                getInterface.jsonp(options, function (results, params) {
                    if (!Authentication.checkLogin(true)) {
                        return false;
                    }
                    ;
                });
            }
            loadData();
        }
        ;
    }

    //由购物车界面返回，刷新商品详情购物车数量
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'my-car') { //购物车
            loadData();
        }
    });
    //		//停止滑动
    //	$scope.stopScroll = function() {
    //		$ionicSlideBoxDelegate.stop();
    //	}

});
/*详情*/
app.controller('MallShopDetailCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $sce) {
    var product_id = $stateParams.id;
    var options = {};
    var loadData = function () {
        options = {
            page: false,
            module: 'FM_SHOP_PRODUCT_CONTENT',
            params: {
                product_id: product_id
            }
        };
        getInterface.jsonp(options, function (results, params) {

            if (results.status == 'Y') {
                $scope.DetailAll = results.results;
                var content = $scope.DetailAll.pcontent;
                $scope.pContent = $sce.trustAsHtml(content);
            }

        });
    }
    loadData();
});
/*评价*/
app.controller('MallEvaluateCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state) {
    $scope.product_id = $stateParams.id;
    var options = {};
    $scope.sortid = 0;
    $scope.evalType = '';
    var loaEvaldData;
    //评价选项
    $scope.categoryOrder = function (sortidtype) {

        switch (sortidtype) {
            case 0:
                $scope.evalType = '';
                break;
            case 1:
                $scope.evalType = 1;
                break;
            case 2:
                $scope.evalType = 0;
                break;
            case 3:
                $scope.evalType = -1;
                break;

        }
        $ionicScrollDelegate.scrollTop();
        $scope.sortid = sortidtype;
        $scope.page = 1;
        $scope.evalList = [];
        $scope.listdata1 = false;
        loaEvaldData = function () {
            var options = {
                page: $scope.page,
                canLoadMore: false,
                module: 'FM_SHOP_COMMENT_LIST',
                params: {
                    product_id: $scope.product_id,
                    commscore: $scope.evalType,
                    current_page: $scope.page,
                    page_size: 10
                }
            };
            getInterface.jsonp(options, function (results, params) {

                if (results.status == 'Y') {
                    angular.forEach(results.results.comment_list, function (rows, index, array) {
                        $scope.evalList.push(rows);
                    });
                    $scope.canLoadMoreGoodsList = true;
                    $scope.page++;
                    if (!results.page || results.page >= results.pagecount) {
                        $scope.canLoadMoreGoodsList = false;
                    }
                    $scope.evaAll = results.results.allnum; //全部数量
                    $scope.evaUpper = results.results.goodnum; //好评数量
                    $scope.evaMiddle = results.results.moderatenum; //中评数量
                    $scope.evaDown = results.results.negativenum; //差评数量
                    //				$scope.evaImg = results.results.imgnum; //图片数量
                    if ($scope.evalList.length == 0) {
                        $scope.listdata = true;
                    } else if ($scope.evalList.length > 0) {
                        $scope.listdata = false;
                    }
                    //	            $rootScope.evalAll = results.results;
                    //	            $scope.page = results.page;
                    //	            $scope.evalList = params.data[5];
                    //
                } else {
                    Xalert.loading(results.error_msg, 2000);
                }

            });
        }
        loaEvaldData();
    }
    $scope.categoryOrder($scope.sortid);
    //	//评价晒图
    //	var loadData;
    //	$scope.imgShow = function() {
    //		$ionicScrollDelegate.scrollTop();
    //		$scope.listdata = false;
    //		$scope.sortid = 4;
    //		$scope.page = 1;
    //		$scope.imgList = [];
    //		loadData = function() {
    //			var options = {
    //				page: $scope.page,
    //				data: $scope.imgList,
    //				canLoadMore: false,
    //				module: 'FM_SHOP_PRODUCT_PIC',
    //				params: {
    //					current_page: $scope.page,
    //					page_size: 10,
    //					product_id: $scope.product_id
    //				}
    //			};
    //			getInterface.jsonp(options, function(results, params) {
    //				$scope.page = params.page;
    //				$scope.imgList = params.data;
    //				//	        	alert($scope.imgList.length);
    //				//	        	$scope.imgList = results.results;
    //				if($scope.imgList.length == 0) {
    //					$scope.listdata1 = true;
    //				} else if($scope.imgList.length > 0) {
    //					$scope.listdata1 = false;
    //				}
    //				$scope.counts = results.counts;
    //				$scope.canLoadMoreGoodsList = params.canLoadMore;
    //			});
    //		}
    //		loadData();
    //		//    		晒图上拉加载
    //		$scope.loadMoreGoodsList1 = function() {
    //			setTimeout(function() {
    //				$scope.canLoadMoreGoodsList = false;
    //				loadData();
    //				setTimeout(function() {
    //					$scope.$broadcast('scroll.infiniteScrollComplete');
    //				}, 1000);
    //			}, 1000);
    //		};
    //	}
    //	评价列表上拉加载
    $scope.loadMoreGoodsList = function () {
        setTimeout(function () {
            $scope.canLoadMoreGoodsList = false;
            if ($scope.sortid == 4) {
                //	        	alert('晒图');
                loadData();
            } else {
                //	        	alert('sss');
                loaEvaldData();
            }
            setTimeout(function () {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 1000);
        }, 1000);
    };
    // 	评价下拉刷新
    $scope.doRefresh = function () {
        $scope.page = 1;
        $timeout(function () {
            if ($scope.sortid == 4) {
                $scope.imgList = []; //晒图
                loadData();
            } else {
                $scope.evalList = []; //评价列表
                loaEvaldData();
            }
            //			$scope.categoryOrder($scope.sortid);//解决下拉刷新，数据加载2次
            $scope.$broadcast('scroll.refreshComplete');
        }, 500);
    };

    //获取大图数组
    $scope.getLargePicArray = function (list) {
        var picArray = [];
        if (list) {
            angular.forEach(list, function (value, key) {
                picArray.push(value.cimg_large);
            });
        }
        return picArray;
    }

});