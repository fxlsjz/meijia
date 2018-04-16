<?php
use common\components\wechat_pay_web\WxPayConf_pub;

$test = false;
$openid = $nickname = $wechatimage ='""';
if(!isset($_COOKIE['openid']) || empty($_COOKIE['openid'])){
        if ( strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false ) {
            $options = [
                'cachepath'=>'runtime/',
                'appid'=> WxPayConf_pub::APPID, //填写高级调用功能的app id
                'appsecret'=> WxPayConf_pub::APPSECRET, //填写高级调用功能的密钥
            ];
            $weObj = new \common\components\Wechat($options);
            
            $user_info = [];
            $is_wechat = stripos($_SERVER['HTTP_USER_AGENT'], 'micromessenger');

            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            $callback = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            if ((!isset($_GET['code']) || $_GET['code']=='code' ) && $is_wechat !== false){
                $url = $weObj->getOauthRedirect($callback, '333', 'snsapi_userinfo');
                Header("Location: $url");
                exit;
            }
            if (!$test){
            $access_token = $weObj->getOauthAccessToken();
            }
            // file_put_contents('./runtime/log-'.time().'.log',$access_token);
            if (!$access_token){
                $user_info['headimgurl']=$user_info['openid'] = '""';
                $user_info['nickname'] = '""';
            }else{
                $user_info = $weObj->getOauthUserinfo($access_token['access_token'],$access_token['openid']);
            }
            $openid = !empty($user_info['openid'])?$user_info['openid']:'""';
            $nickname =  !empty($user_info['nickname'])?$user_info['nickname']:'""';
            $wechatimage =  !empty($user_info['headimgurl'])?$user_info['headimgurl']:'""';
        }
        
        setcookie("openid", $openid, time()+60*60*24*365);//设置cookie值和有效期
        setcookie("wechatimage", $wechatimage, time()+60*60*24*365);//设置cookie值和有效期
        setcookie("wechatname", $nickname, time()+60*60*24*365);//设置cookie值和有效期
}

