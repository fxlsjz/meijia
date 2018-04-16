<?php
$params = [
//       //短信帐号
//	'shcl_sms'=> [
//	    'account'=> 'mobokj_doctor',
//		'pwd'=> 'Mobo1688',
//             'account_batch'=> 'mobokj_doctor2',
//		'pwd_batch'=> 'Mobo1688',
//             'account_doctor'=> 'mobokj_doctor3',
//		'pwd_doctor'=> 'Mobo1688',
//            'maxcount'=>'5',
//	],
    //短信验证码帐号密码 上海创蓝
	'shcl_sms'=> [
	    'account'=> 'mobokj_pingtai',
		'pwd'=> 'MObo0801PingTAI'
	],
	'alipay'=> [
		'PARTNER'=> '2088221764271310',
		'ALIPAY_KEY'=> 'dfhsjm0vv581xupzytbbstrdpx03mu3g',
		'ALIPAY_ACCOUNT'=> '',//bchtongyuan@sina.com
		'ALIPAY_URI'=> 'https://mapi.alipay.com/gateway.do',
		'ALIPAY_MOBILE_URI'=> 'http://wappaygw.alipay.com/service/rest.htm',
		'ALIPAY_GETWAY_KEY'=> 'abc',
	    'LOG_PATH'=>__DIR__.'/../../runtime/logs/refundOrders/'
	],
    'Easemob'=>[
        'client_id'=>'YXA6lXCO0H0iEeW-TcHqm9-S-Q',
        'client_secret'=>'YXA6xLAmsmoiQP6xcxDtgvpC1mOOe5U',
        'org_name'=>'mobo-china',
        'app_name'=>'moboo2oqyzy',
        'time'=>60*1000,
    ],
    'jpush' => [
        'url' => 'https://api.jpush.cn/v3/push',
        'masterSecret' => ['user' => '06648ef5b3e123a6d52e2b32', 'beautician' => '10beb676e1ee93ce46c79743'],
        'appkey' => ['user' => 'cf8fdd9bc13d551a0f5ce42d', 'beautician' => 'dd910293e9635c2286fbb675'],
    ],
	/*
	 * 订阅
	 */
	'logistics_maintain'=>[
		'EBusinessID' => '1263612',
		'appkey' => '472e1de0-e1ee-4967-8186-c2310ab183ab',
		//请求url测试地址
//        'ReqURL' => 'http://testapi.kdniao.cc:8081/api/dist',
		//请求url正式地址
		'ReqURL' => 'http://api.kdniao.cc/api/dist',
	],
	/*
	 * 单号查询
	 */
	'logistics'=>[
		'EBusinessID' => '1263612',
		'appkey' => '472e1de0-e1ee-4967-8186-c2310ab183ab',
		//请求url测试地址
//        'ReqURL' => 'http://testapi.kdniao.cc:8081/Ebusiness/EbusinessOrderHandle.aspx',
		//请求url正式地址
		'ReqURL' => 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx',
	],
    'token.expire'=>'1296000',
    'WechatpayUrl'=>'m.mdk2appwechat.test.chinamobo.com',
];
if(IS_TESTING){
    $params['Easemob']['client_id']='YXA6IgcFMOTkEeWDFo1gMnKWxA';
    $params['Easemob']['client_secret']='YXA6ZJ_q3iCAU7whakBTRKwBi-CL7io';
    $params['Easemob']['org_name']='mobo-china';
    $params['Easemob']['app_name']='mobo020qyzycs';
    $params['WechatpayUrl']='m.mdk2appwechat.test.chinamobo.com';
}

return $params;