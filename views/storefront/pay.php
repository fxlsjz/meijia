<!doctype html>
<html>
<head>
<meta charset="utf-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    <title></title>
    <?php echo $this->render('/_include/_header'); ?>
    <script>
            var myScroll;
            var pageNo = 1;
            var page = 1;
            var actualprice = '<?php echo $_GET['actualprice']?>';

            var identification = <?php echo $this->context->identification(['FM_APP_SET_VALUE','FM_SHOP_WECHAT_PAY'])?>;
            var oid = '<?php echo $_GET['oid']?>';
            var timestamp = '<?php echo $_GET['timestamp']?>';

            var processType = '<?php echo $_GET['processType']?>';
    //        var company_id = '<?php //echo isset($_GET['company_id']) ? $_GET['company_id'] : ''?>//';
            var company_id = '<?php echo $_GET['company_id']?>';
            $.cookie('company_id', company_id, {expires: 30, path: '/'});

            getQueryString = function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return decodeURIComponent(r[2]);    //(r[2]);
                return "";
            };
            var userid = getQueryString("user_id");
            //从问号 (?) 开始的 URL（查询部分）
            var curUrl = window.location.search;
            //要跳转的Url
            var backUrl = curUrl.substring(curUrl.lastIndexOf('http'), curUrl.length);
            if (timestamp == (localStorage.getItem('timestamp_two'))) {//代表返回
                localStorage.removeItem('timestamp_two');

                //支付成功后，返回该界面时的操作
                if (processType == 'commodityFirst') {//商品首次支付
                    window.history.go(-2);//返回购物车
                } else if (processType == 'serviceFirst') {//服务首次支付
                    window.history.go(-1);//返回提交订单
                } else {
                    window.history.go(-2);
                }
            } else {//进去
            }
            //立即支付
            function get_paymengt() {
                var param = {into: 12.8, service_code: 'FM_SHOP_WECHAT_PAY', oid: oid};
                getData({
                    data: param,
                }, function (res) {
                    data = res.results;
                    pay_info = JSON.stringify(data);
                    if (res.status == 'N') {
                        Xalert(res.error_msg, 1000);

                        return false;
                    }
                    //调用微信JS api 支付
                    var jsApiCall = function () {
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest',
                            {
                                "appId": data.appId,
                                "timeStamp": data.timeStamp,
                                "nonceStr": data.nonceStr,
                                "package": data.package,
                                "signType": data.signType,
                                "paySign": data.paySign
                            },
                            function (res) {
                                //支付成功
                                if (res.err_msg == 'get_brand_wcpay_request:ok') {
                                    Xalert('支付成功', 1000);


                                    //存储代表支付过的时间戳
                                    localStorage.setItem('timestamp_two', timestamp);
                                    if (processType == 'commodityFirst') {//商品首次支付
                                        if (backUrl) {
                                            window.location.href = backUrl + '&paySuccess=Y';
                                        }
                                    } else if (processType == 'commoditySecondList') {//商品订单列表2次支付
                                        window.history.go(-2);//返回商品订单列表
                                    } else if (processType == 'commoditySecondDetail') {//商品订单详情2次支付
                                        window.history.go(-2);//返回商品订单列表
                                    } else if (processType == 'serviceFirst') {//服务首次支付
                                        if (backUrl) {
                                            window.location.href = backUrl + '&paySuccess=Y';
                                        }
                                    } else if (processType == 'serviceSecondList') {//服务订单列表2次支付
                                        window.history.go(-2);//返回服务订单列表
                                    } else if (processType == 'serviceSecondDetail') {//服务订单详情2次支付
                                        window.history.go(-3);//返回服务订单列表
                                    } else if (processType == 'recharge') {//钱包充值
                                        window.history.go(-2);//返回我的钱包
                                    } else if (processType == 'subscribe') {//套票预约
                                        window.history.go(-2);
                                    } else if (processType == 'ticketList') {//套票（List）
                                        window.history.go(-2);
                                    } else if (processType == 'ticketDetail') {//套票（Detail）
                                        window.history.go(-3);
                                    } else {
                                        window.history.go(-2);
                                    }
                                }

                                //支付过程中用户取消or支付失败
                                if ((res.err_msg == "get_brand_wcpay_request:cancel") || (res.err_msg == "get_brand_wcpay_request:fail")) {
                                    Xalert('取消支付', 1000);
                                    //存储代表支付过的时间戳
                                    localStorage.setItem('timestamp_two', timestamp);
                                    if (processType == 'commodityFirst') {//商品首次支付
                                        if (backUrl) {
                                            window.location.href = backUrl + '&paySuccess=N';
                                        }
                                    } else if (processType == 'commoditySecondList') {//商品订单列表2次支付
                                        window.history.go(-2);//返回商品订单列表
                                    } else if (processType == 'commoditySecondDetail') {//商品订单详情2次支付
                                        window.history.go(-2);//返回商品订单列表
                                    } else if (processType == 'serviceFirst') {//服务首次支付
                                        if (backUrl) {
                                            window.location.href = backUrl + '&paySuccess=N';
                                        }
                                    } else if (processType == 'serviceSecondList') {//服务订单列表2次支付
                                        window.history.go(-2);//返回服务订单列表
                                    } else if (processType == 'serviceSecondDetail') {//服务订单详情2次支付
                                        window.history.go(-3);//返回服务订单列表
                                    } else if (processType == 'recharge') {//钱包充值
                                        window.history.go(-2);//返回我的钱包
                                    } else if (processType == 'subscribe') {//套票预约
                                        window.history.go(-2);
                                    } else if (processType == 'ticketList') {//套票（List）
                                        window.history.go(-2);
                                    } else if (processType == 'ticketDetail') {//套票（Detail）
                                        window.history.go(-3);
                                    } else {
                                        window.history.go(-2);
                                    }
                                }
                            });
                    }
                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', jsApiCall);
                            document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
                        }
                    } else {
                        jsApiCall();
                    }
                });
            }
            //确认取消支付按钮
            function cancel() {
                $('#ushowhide').animate({top: "-100%"}, 500);
                Xalert('已取消支付', 1000);

                //存储代表支付过的时间戳
                localStorage.setItem('timestamp_two', timestamp);
                if (processType == 'commodityFirst') {//商品首次支付
                    if (backUrl) {
                        window.location.href = backUrl + '&paySuccess=N';
                    }
                } else if (processType == 'commoditySecondList') {//商品订单列表2次支付
                    window.history.go(-2);//返回商品订单列表
                } else if (processType == 'commoditySecondDetail') {//商品订单详情2次支付
                    window.history.go(-2);//返回商品订单列表
                } else if (processType == 'serviceFirst') {//服务首次支付
                    if (backUrl) {
                        window.location.href = backUrl + '&paySuccess=N';
                    }
                } else if (processType == 'serviceSecondList') {//服务订单列表2次支付
                    window.history.go(-2);//返回服务订单列表
                } else if (processType == 'serviceSecondDetail') {//服务订单详情2次支付
                    window.history.go(-3);//返回服务订单列表
                } else if (processType == 'recharge') {//钱包充值
                    window.history.go(-2);//返回我的钱包
                } else if (processType == 'subscribe') {//套票预约
                    window.history.go(-2);
                } else if (processType == 'ticketList') {//套票（List）
                    window.history.go(-2);
                } else if (processType == 'ticketDetail') {//套票（Detail）
                    window.history.go(-3);
                } else {
                    window.history.go(-2);
                }
            }
            //显示取消支付弹窗
            function ushow() {
                $('#ushowhide').animate({top: "0"}, 500);
            }
            //隐藏取消支付弹窗
            function cancel1() {
                $('#ushowhide').animate({top: "-100%"}, 500);
            }
            //        //返回上一页
            //        function goBack() {
            //            window.history.go(-1);
            //        }
        </script>
</head>
<body class="bg-eeeeee">
<div class="uinn" >
    <div class="menu-list">
        <div class="form">
            <h4 class="margin-b-1 u-company"></h4>
            <h2 class="c-E64C65">¥<?php echo $_GET['actualprice'] ?></h2>
        </div>
        <div class="form-con margin-t-1">
            <p class="ub ulev-1 margin-b-10"><span class="c-747474">收款方: </span><span class="ub-f1 u-company"
                                                                                         style="display:block; text-align:left;"></span>
            </p>
        </div>
    </div>
</div>
<div class="submit margin-t-20" style="background-color: #ffffff;position: absolute;width: 100%;bottom: 0;height:52px; border-top:1px solid #dedede;" onClick="get_paymengt()" >
    <div class="submit-block ub tx-middle uc-a1" style="margin-top: 15px;"onClick="get_paymengt()">
        <div class="load uhide"></div>
        <font class="c-fff" style="color:#DF3680; " onClick="get_paymengt()">立即支付</font></div>
</div>
<?php echo $this->render('/_include/_footer'); ?>
<div id="ushowhide" class="mask opacity tx-middle"  style="top:-100%;position: absolute;width: 100%; height: 100%;">
    <div class="mask-main uc-a1 c-wh" style="background-color: #f7f7f7;">
        <h1 class="c-E64C65 tx-middle" style="color: #DF3680; margin: 1rem;">是否取消?</h1>
        <div class="ub btn-bc" style="border-top: 1px solid #dedede;">
            <div onclick="cancel1()" class="ub-f1 tx-middle canel c-E64C65" style="color: #DF3680; margin: 1rem;">不取消</div>
             <div style="height:10px;width;2px;background-color:#000000;"></div>
            <div class="ub-f1 c-E64C65 tx-middle canel" onClick="cancel()" style="color: #DF3680; margin: 1rem;" onClick="cancel()">取消</div>
        </div>
    </div>
</div>
<!--分享弹出框-->
<div id="masks" class="mask opacity share_wechat ub-img4 uhide" onClick="$('#masks').addClass('uhide');"></div>
<script>
    //		get_paymengt()
    /*获取url参数 start*/
    function request(strParame) {
        var args = new Object();
        var query = location.search.substring(1); //去掉问号

        var pairs = query.split("&"); // Break at ampersand
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue;
            var argname = pairs[i].substring(0, pos);
            var value = pairs[i].substring(pos + 1);
            value = decodeURIComponent(value);
            args[argname] = value;
        }
        return args[strParame];
    }

    /*比如你要获取aaa.aspx?id=2
     使用方法为：var id= request('id');*/
    /*获取url参数 end*/
</script>
</body>
</html>