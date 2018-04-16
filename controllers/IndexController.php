<?php
namespace appwechat\controllers;

use Yii;

use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;

use yii\helpers\Url;
use backend\models\Users;
use common\components\QiyeWechat;

/**
 * Site controller
 */
class IndexController extends \appwechat\base\BaseFrontendController
{
    public $layout = false;


    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'ruleConfig' => ['class' => 'appwechat\base\AccessRule'],
                'rules' => [
                    [
                        'actions' => ['index', 'share_beau', 'login_m', 'copy_insurance', 'index_wechat', 'download', 'downloads', 'user_download', 'copy_order', 'copy_service', 'login', 'red_index', 'red_indexs', 'red_new', 'red_old', 'no_support', 'red_news', 'red_order', 'red_ordinary', 'red_order_detail', 'red_ordinary_detail', 'index_four', 'about', 'getwechatcode'],
                        'allow' => true,
                        'roles' => ['?', '@'],
                    ],
                    [
                        //登录状态下允许的action
                        'actions' => ['notice', 'submit'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
        ];
    }


    public function actionIndex($platform = '')
    {
        if (!isset($_COOKIE['openid']) || !isset($_COOKIE['staffid'])) {
            $this->run('wechat/oauth',['platform'=>$platform]);
        }
        
        return $this->render('index');
        
    }

    public function actionRed_order($backurl = '', $test = false)
    {
        $openid = $nickname = $headimgurl = '';
        if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
            $user_info = [];
            $weObj = $this->wechatObject();
            $is_wechat = stripos(Yii::$app->request->headers->get('User-Agent'), 'micromessenger');
            $coupon_id = $_REQUEST['coupon_id'];
            $coupon_remark = $_REQUEST['coupon_remark'];
            if ((!isset($_GET['code']) || $_GET['code'] == 'code') && $is_wechat !== false) {
                $callback = Yii::$app->urlManager->createAbsoluteUrl('index/red_order') . '?coupon_id=' . $coupon_id . '&coupon_remark=' . $coupon_remark;
                $url = $weObj->getOauthRedirect($callback, '333', 'snsapi_userinfo');
                Header("Location: $url");
                exit;
            }
            if (!$test) {
                $access_token = $weObj->getOauthAccessToken();
            }
            if (!$access_token) {
                $user_info['openid'] = '';
                $user_info['nickname'] = '';
            } else {
                $user_info = $weObj->getOauthUserinfo($access_token['access_token'], $access_token['openid']);
            }
        }
        $openid = isset($user_info['openid']) ? $user_info['openid'] : '';
        $nickname = isset($user_info['nickname']) ? $user_info['nickname'] : '';
        $headimgurl = isset($user_info['headimgurl']) ? $user_info['headimgurl'] : '';


        //查询用户是否已经领取过代金券
        $is_recevice = "Y";
        $user = new Users();

        $coupon_order = isset($_GET['coupon_remark']) ? urlencode($_GET['coupon_remark']) : '';//$user->get_coupon_remark($_GET,'coupon_remark'):'';

        $result = $user->is_recevice($openid, $_GET);
        if (!$result) {
            $is_recevice = "N";
        }
        $coupon_id = isset($_GET['coupon_id']) ? urlencode($_GET['coupon_id']) : '';
        return $this->render('red_order', ['openid' => $openid, 'nickname' => $nickname, 'headimgurl' => $headimgurl, 'is_recevice' => $is_recevice, 'coupon_remark' => $coupon_order, 'coupon_id' => $coupon_id]);
    }

    public function actionRed_ordinary($backurl = '', $test = false)
    {
        $openid = $nickname = $headimgurl = '';
        if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
            $user_info = [];
            $weObj = $this->wechatObject();
            $is_wechat = stripos(Yii::$app->request->headers->get('User-Agent'), 'micromessenger');
            // $coupon_id = urldecode($_REQUEST['coupon_id']);
            if ((!isset($_GET['code']) || $_GET['code'] == 'code') && $is_wechat !== false) {
                $couponid = isset($_REQUEST['coupon_id']) ? $_REQUEST['coupon_id'] : '';
                $description = isset($_REQUEST['description']) ? $_REQUEST['description'] : '';
                $callback = Yii::$app->urlManager->createAbsoluteUrl('index/red_ordinary') . '?coupon_id=' . $couponid . '&description=' . $description;
                $url = $weObj->getOauthRedirect($callback, '333', 'snsapi_userinfo');
                Header("Location: $url");
                exit;
            }
            if (!$test) {
                $access_token = $weObj->getOauthAccessToken();
            }
            // file_put_contents('./runtime/log-'.time().'.log',$access_token);
            if (!$access_token) {
                $user_info['openid'] = '';
                $user_info['nickname'] = '';
            } else {
                $user_info = $weObj->getOauthUserinfo($access_token['access_token'], $access_token['openid']);
            }
        }
        $openid = isset($user_info['openid']) ? $user_info['openid'] : '';
        $nickname = isset($user_info['nickname']) ? $user_info['nickname'] : '';
        $headimgurl = isset($user_info['headimgurl']) ? $user_info['headimgurl'] : '';
        //查询用户是否已经领取过代金券
        $is_recevice = "Y";
        $user = new Users();
        $result = $user->is_recevice($openid, $_GET);
        if (!$result) {
            $is_recevice = "N";
        }
// var_dump(urlencode($_GET['coupon_id']));die;        
        // $data = $user->get_coupon_description(urlencode($_GET['description']));//description
        $coupon_id = isset($_GET['coupon_id']) ? $_GET['coupon_id'] : '';
        $description = isset($_GET['description']) ? urlencode($_GET['description']) : '';
        // var_dump($description);die;
        // $id = $user->get_coupon_remark($_REQUEST['coupon_id']);     
        return $this->render('red_ordinary', ['openid' => $openid, 'nickname' => $nickname, 'headimgurl' => $headimgurl, 'is_recevice' => $is_recevice, 'coupon_id' => $coupon_id]);
    }

//     微信授权
    public function actionGetwechatcode()
    {
        return $this->render('get_wechat_code');
    }

}
