<?php

namespace appwechat\base;

use Yii;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use yii\helpers\VarDumper;
use yii\data\Pagination;
use common\models\Board;
use common\components\wechat_pay_web\WxPayConf_pub;
use common\components\QiyeWechat;
use common\models\Company;
use common\components\Wechat;


/**
 * Site controller
 */
class BaseFrontendController extends \base\BaseController
{
	

	public $baseUrl = '';

	public $isWechat;
	
	public $company_id;
	
	public $host;
	
	public $cookiesDomain;
	
	public $language = 'zh_CN';
	
	public $domainNameCacheKey = 'company:domainName';
	
	private $eDomainName;
	
	//由子域名识别出来的eid
	private $companyid;


	public function init(){
	    parent::init();
	     
// 	    $this->cookiesDomain = Yii::$app->params['companyUrl'];
	    $this->cookiesDomain = $_SERVER['HTTP_HOST'];
	    $this->host = 'http://duoke.test.chinamobo.com/';
	    $this->isWechat = isset($_SERVER['HTTP_USER_AGENT']) ? strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') : false;
	    $this->company_id = isset($_GET['company_id']) ? $_GET['company_id'] : $this->getCompanyId();
	
	}
	
	/**
	 * GET 请求
	 * @param string $url
	 */
	public function http_get($url, $returnArray = true){
		$oCurl = curl_init();
		if(stripos($url,"https://")!==FALSE){
			curl_setopt($oCurl, CURLOPT_SSL_VERIFYPEER, FALSE);
			curl_setopt($oCurl, CURLOPT_SSL_VERIFYHOST, FALSE);
			curl_setopt($oCurl, CURLOPT_SSLVERSION, 1); //CURL_SSLVERSION_TLSv1
		}
		curl_setopt($oCurl, CURLOPT_URL, $url);
		curl_setopt($oCurl, CURLOPT_RETURNTRANSFER, 1 );
		$sContent = curl_exec($oCurl);
		$aStatus = curl_getinfo($oCurl);
		curl_close($oCurl);
		if(intval($aStatus["http_code"])==200){
			return $returnArray ? json_decode($sContent, true) : $sContent;
		}else{
			return false;
		}
	}
	
	public function wechatJsSign($app = 'wechat'){
	    $weObj = $this->wechatObject();
        // 注意 URL 一定要动态获取，不能 hardcode.
		$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
		$url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
		$signPackage = $weObj->getJsSign($url);
		return $signPackage;
		
	}
	
	/**
	 * 接口签名
	 * @param string $url
	 */
	public function identification($service_code = []){
        $identification = [];
		$time = time();
		foreach($service_code as $v){
			$identification[$v] = [
			    'unique_identification'=> md5($v.'chinamobo'.$time),
				'time_stamp' => $time
			];
		}
		return json_encode($identification);
	}

	/**
     * 微信类
     */
    public function wechatObject($app = 'wechat'){
        $sql = "select `appid`,`appsecret` from {{%company_pay_account}} where `companyid` = '".$this->company_id."' and type=1";
        $options = Yii::$app->db->createCommand($sql)->queryOne();
        $options['cachepath'] = dirname(Yii::getAlias('@common')).DIRECTORY_SEPARATOR.'runtime'.DIRECTORY_SEPARATOR;
        return new  Wechat($options);
    }
    
    
    //通过二级域名获取 组织ID
    public function getCompanyId($url = false){
        $company_id = 'f00dfde1_4119_5556_b9e8_47174d7a55a9';
        if ($this->domainNameCacheKey){
            $company_id = Yii::$app->redis->executeCommand('HGET', [$this->domainNameCacheKey, $this->getDomainName($url)]);
            $company_id = $company_id ? $company_id : 'f00dfde1_4119_5556_b9e8_47174d7a55a9';
        }
        $this->companyid = $company_id;
        return $company_id;
    }
    
    //获取二级域名
    public function getDomainName($url = false){
        $url = $url ? $url : $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        $domainName = explode($this->cookiesDomain, $url);
        $domain = '';
        if (isset($domainName[1]) && !empty($domainName[0])){
            $domain = str_replace(['.', 'http://'],'', $domainName[0]);
        }else{
            $parse_url = parse_url($url);
            if (isset($parse_url['query'])){
                $parse_str = parse_str($parse_url['query'], $output);
                if (isset($output['qywechat-appid'])){
                    $domain = $output['qywechat-appid'];
                }
            }
        }
        $this->eDomainName = $domain;
        return $domain;
    }
    
    
    //通过二级域名获取 组织ID
    public function getEnterpriseQyWechat($company_id){
        $sql = "select `qywechat` from {{%company}} where `cuid` = '".$company_id."'";
        $data = self::query($sql, [], 'scalar', false);
        return $data ? json_decode($data, true) : [];
    
        //return Yii::$app->filecache->get('enterprise_'.$company_id);
    }
    
    //取一级域名,COOKIE域名用
    public function getCookiesDomain(){
        $domain = array_reverse(explode('.', $_SERVER['HTTP_HOST']));
        $ret = [];
        foreach($domain as $key=>$value){
            if ($key < 2) $ret[] = $value;
        }
        return '.'.join('.', array_reverse($ret));
    }
    
    /**
     * 企业微信类
     */
    public function QyWechatObject(){
        $options = Yii::$app->params['wechat']['qy'];
        return new QiyeWechat($options);
    }

    /*
     * 公众号登录授权
     */
    public function mpWechatRedirect($test = false){
        $openid = $nickname = $wechatimage ='""';
        
        if ($this->isWechat !== false) {
            $weObj = $this->wechatObject();
        
            $user_info = [];
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            $callback = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            if ((!isset($_GET['code']) || $_GET['code']=='code' ) && $this->isWechat  !== false){
                $url = $weObj->getOauthRedirect($callback, '333', 'snsapi_userinfo');
                Header("Location: $url");
                exit;
            }
            if (!$test){
                $access_token = $weObj->getOauthAccessToken();
            }
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
        
        setcookie("openid", $openid, time()+60*60*24*30, '/');
        setcookie("wechatimage", $wechatimage,  time()+60*60*24*30, '/');
        setcookie("company_id", $this->company_id,  time()+60*60*24*30, '/');
    }
    
    /*
     * 企业号授权
     * */
    public function qyWechatRedirect(){
    
        $domain = 'http://duoke.test.chinamobo.com';
    
        $url = isset($_GET['url']) ? $_GET['url'] : Yii::$app->request->hostInfo.'/qywechat';
        $json['company_id'] = $this->getCompanyId($url);
        if($json['company_id']){
            $wechat = $this->getEnterpriseQyWechat($json['company_id']);
        }else{
            $domainName = explode(Yii::$app->params['companyUrl'], $url);
            $appid = str_replace(['.', 'http://'],'', $domainName[0]);
    
            $appidInfo=Yii::$app->redis->executeCommand('HGET',['QyWechatSuiteOauthCallback', $appid]);
            $appidInfo=json_decode($appidInfo,true);
            $wechat=$appidInfo['qywechat'];
        }
        if (isset($wechat['appid']) && $wechat['appid']){
            $appid = trim($wechat['appid']);
            $url = Yii::$app->request->hostInfo.'/qywechat';
            $redirect_uri = urlencode($domain.'/appwechat/index.php/wechat/redirect-callback?appid='.$appid.'&company_id='.$json['company_id'].'&url='.urlencode($url));

            $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={$appid}&redirect_uri={$redirect_uri}&response_type=code&scope=snsapi_base&state=duoke".round(0,100)."&connect_redirect=1#wechat_redirect";

        }
        $this->redirect($url);
    }
   
    
    public function oauthLogined($userInfo, $cookiesDomain){
        $company_id = $userInfo['company_id'];
        $token = $this->UpdateToken($userInfo['staffid'], $company_id);
        if ($company_id){
            $sql = 'select `name` from {{%company}} where `cuid` = :company_id';
            $userInfo['enterprise'] = self::query($sql, ['company_id'=> [$company_id]], 'scalar', false);
        }else{
            $userInfo['enterprise'] = '摩博科技';
        }
        header('P3P: CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
        
        setcookie('staffid', $userInfo['staffid'], time()+60*60*24*30, '/', $cookiesDomain);
        setcookie('token', $token['token'], time()+60*60*24*30, '/', $cookiesDomain);
        setcookie('role', $userInfo['role'], time()+60*60*24*30, '/', $cookiesDomain);
        setcookie('store_id', $userInfo['store_id'], time()+60*60*24*30, '/', $cookiesDomain);
        setcookie('company_id', $company_id, time()+60*60*24*30, '/', $cookiesDomain);
    }
    
    //企业号是否授权登录过（一天内）
    public function qyWechatOAuth(){
        $OAuth = isset($_COOKIE['QyWechatOAuth']) ? $_COOKIE['QyWechatOAuth'] : '';
        //echo '$OAuth'.$OAuth;
    
        return $OAuth == 'Y';
    }
    
    
    /**
     * 更新TOKEN
     * @return json
     * author xiongyouliang
     * datetme 2014-08-21
     */
    public function UpdateToken($uid){
        $token = self::NewToken($uid);
        $expire = time() + 7*86400;//7
       
        $sql = "REPLACE INTO {{%token}}(`uid`, `token`, `expire`) VALUES(:uid, :token, :expire)";
        $param = array(
            'uid' => array($uid),
            'token' => array($token),
            'expire' => array($expire),
        );
        
        $data = self::queryResult($sql, $param,false);
        return array('token'=>$token, 'expire'=>$expire);
    }
    
    /**
     * 生成TOKEN
     * @return string
     * author xiongyouliang
     * datetme 2014-08-21
     */
    public function NewToken($uid){
        return md5(time().$uid.rand(0,999));
    }
}
