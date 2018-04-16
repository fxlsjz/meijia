<?php
namespace appwechat\controllers;

use Yii;
use backend\base\BaseApiController;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use backend\models\Config;

use yii\helpers\Url;
use common\components\wechat_pay_web\UnifiedOrder_pub;
use common\components\wechat_pay_web\WxPayConf_pub;
use common\components\wechat_pay_web\JsApi_pub;
use common\components\wechat_pay_web\Common_util_pub;
use common\components\wechat_pay_web\Wxpay_server_pub;

use common\components\Wechat;
use common\models\ProductOrder;
use common\models\ProductOrderinfo;

/**
 * Site controller
 */
class OrderController extends \appwechat\base\BaseFrontendController
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
                        //登录状态下允许的action
                        'actions' => ['index', 'order_detail', 'order_pay', 'real_order', 'eval_beautician', 'order_list', 'order_number', 'order_service', 'order_submit', 'order_service_detail', 'return_url', 'refund_url', 'order_storedetails'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                    [
                        //登录状态下允许的action
                        'actions' => ['buy', 'wechat'],
                        'allow' => true,
                        'roles' => ['?', '@'],
                    ],
                ],
            ],
        ];
    }


    public function actionLogout()
    {
        Yii::$app->user->logout();

        return $this->goHome();
    }

    public function actionIndex()
    {
        $data['signPackage'] = $this->wechatJsSign('wechat');
        return $this->render('index', $data);
    }

    public function actionOrder_detail()
    {
        $data['signPackage'] = $this->wechatJsSign('wechat');
        return $this->render('order_detail', $data);
    }

    public function actionReal_order()

    {

        return $this->render('real_order');
    }

    public function actionOrder_pay()
    {

        return $this->render('order_pay');
    }

    public function actionOrder_number()
    {
        $data['signPackage'] = $this->wechatJsSign('wechat');
        return $this->render('order_number', $data);
    }

    public function actionOrder_list()
    {
        $data['signPackage'] = $this->wechatJsSign('wechat');
        return $this->render('order_list', $data);
    }

    public function actionOrder_service()
    {

        return $this->render('order_service');
    }

    public function actionOrder_submit()
    {

        return $this->render('order_submit');
    }

    public function actionOrder_service_detail()
    {

        return $this->render('order_service_detail');
    }

    public function actionOrder_storedetails()
    {

        return $this->render('order_storedetails');
    }

    //获取微信签名参数
    public function actionBuy()
    {
        $data = $_GET;
        if (!isset($data['oid']))
            return '订单错误!';
        $order_id = $data['oid'];
        $expire_time = 1;

        //商品订单
        $type = 1;
        $orderInfo = ProductOrder::find()->select(['state', 'uid', 'actualprice', 'datetime', 'orderno'])->where(['poid' => $order_id])->asArray()->one();
        //服务订单
        if (!$orderInfo) {
            $type = 2;
            $sql = "SELECT o.`state`,`orid`,o.`uid`,o.`actualprice`,o.`datetime`,o.`orderno`,i.`iteminfo` FROM {{%order}} as o inner join {{%orderinfo}} as i on o.oid=i.oid WHERE o.`oid` = '$order_id'";
            $param = array('order_id' => array($order_id));
            $orderInfo = self::query($sql, $param, 'row', false);
        }

        // 代客下单
        /* if(!$orderInfo){
            $expire_time =0;
            $sql = "SELECT `state`,`uid`,`actualprice`,`datetime`,`orderno`,`iteminfo` FROM {{%order_replaceuser}}  WHERE `orid` = '$order_id'";
            $orderInfo = self::query($sql, array(), 'row', false);
        } */
        //充值订单
        if (!$orderInfo) {
            $type = 3;
            $sql = "SELECT `state`,`uid`,`oprice` as actualprice,`datetime`,`orderno` FROM {{%rechargeorder}}  WHERE `roid` = '$order_id'";
            $orderInfo = self::query($sql, array(), 'row', false);
        }
        if (!$orderInfo)
            return '订单错误';

        if ($type == 1) {
            $orderInfo['iteminfo'] = ProductOrderinfo::find()->select('iteminfo')->where(['poid' => $order_id])->asArray()->all();
            $orderInfo['iteminfo'] = json_encode($this->array_column($orderInfo['iteminfo'], 'iteminfo'));
            if (!$orderInfo['iteminfo'])
                return '订单错误';
            $sql = "update {{%product_order}} set state= 'orderstate_expire' where poid =:oid";
        } else {
            $sql = "update {{%order}} set state= 'orderstate_expire' where oid =:oid";
        }

        $addtime = Config::find()->where(['key' => 'order_expiredtime'])->one();
        if ($orderInfo['state'] == 'orderstate_waitpay' && time() > ($orderInfo['datetime'] + $addtime['val'])) {
            $results = self::queryResult($sql, array('oid' => array($order_id)), false);
            if (isset($orderInfo['orid']) && !empty($orderInfo['orid'])) {
                $sql = "update {{%orderrecord}} set dpostate= 'orderstate_expire' where orid =:orid";
                $results = self::queryResult($sql, array('orid' => array($orderInfo['orid'])), false);
            }

            if ($expire_time == 1) {
                return '该订单已过期!';
            }
        }
        // $product = Dictionary::ordersType($orderInfo['results']['order_type']);//支付类型
        $sql = 'SELECT `wechatname`,`openid` as `wechat_openid` FROM {{%userinfo}} WHERE `uid` = :user_id';
        $userInfo = self::query($sql, array('user_id' => array($orderInfo['uid'])), 'row', false);
        if (!$userInfo)
            return 'user_id错误';
        if (empty($userInfo['wechat_openid']))
            return '微信未授权,请重新授权!';
        // //=========步骤2：使用统一支付接口，获取prepay_id============
        // //使用统一支付接口

        $UnifiedOrder_pub = new UnifiedOrder_pub();

        //商品信息、服务详情
        $orderInfo['iteminfo'] = isset($orderInfo['iteminfo']) ? json_decode($orderInfo['iteminfo'], true) : '';
        $shop_infor = '';
        if (in_array($type, [1, 2])) {
            if (!empty($orderInfo['iteminfo'])) {
                foreach ($orderInfo['iteminfo'] as $o => $v) {
                    $v = is_array($v) ? $v : json_decode($v, true);
                    $shop_infor .= ($type == 1 ? $v['pname'] : $v['iname']) . ',';
                }
                $shop_infor = trim($shop_infor, ',');
            } else {
                return '错误!';
            }
        }

        if (strlen($shop_infor) > 120) {
            $shop_infor = msubstr($shop_infor, 0, 125);
        }
        $shop_infor = !empty($shop_infor) ? $shop_infor : '充值订单';
        //$userInfo['wechat_openid'] = "ojDXrjjbdZ0j7IZJ6h8KGzPe3TLg";
        //设置统一支付接口参数
        $UnifiedOrder_pub->setParameter("openid", $userInfo['wechat_openid']);//商品描述
        $UnifiedOrder_pub->setParameter("body", $shop_infor);//商品描述
        //自定义订单号，此处仅作举例
        $timeStamp = time();


        $UnifiedOrder_pub->setParameter("out_trade_no", $orderInfo['orderno']);//商户订单号 
        $UnifiedOrder_pub->setParameter("total_fee", $orderInfo['actualprice'] * 100);//总金额
        $UnifiedOrder_pub->setParameter("notify_url", WxPayConf_pub::NOTIFY_URL);//通知地址
        $UnifiedOrder_pub->setParameter("trade_type", "JSAPI");//交易类型
        $prepay_id = $UnifiedOrder_pub->getPrepayId();
        //=========步骤3：使用jsapi调起支付============
        $jsApi = new JsApi_pub();
        $jsApi->setPrepayId($prepay_id);

        $jsApiParameters = json_decode($jsApi->getParameters(''), true);
        $jsApiParameters['orderno'] = $orderInfo['orderno'];
        echo json_encode($jsApiParameters);
        exit();
    }

    //微信回调地址
    public function actionWechat()
    {
        var_dump('hello');
        // $this->resultsType = 'object';
        $request = $_GET['pay_info'];
        var_dump($request);
        die;
    }
}
