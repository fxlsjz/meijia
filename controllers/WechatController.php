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
use base\YiiMobo;
use common\components\wechat_pay_web\Wxpay_server_pub;
use common\components\zhongan;
use base\BaseController;
use submodule\modules\sms_captcha\components\Sms;
use common\components\Pay_callback;
use common\components\wechat_pay_web\Refund_pub;
use common\components\QiyeWechat;
use base\BaseActiveRecord;

/**
 * Site controller
 */
class WechatController extends \appwechat\base\BaseFrontendController
{
    public $layout = false;
    public $enableCsrfValidation = false;

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
                        'actions' => ['notify', 'oauth', 'redirect-callback','test'],
                        'allow' => true,
                        'roles' => ['?', '@'],
                    ],
                ],
            ],
        ];
    }

    /**
     * 授权
     * @param unknown $url
     * @param string $platform
     */
    public function actionOauth($platform = '')
    {
        if ($platform == 'qy') {
            $this->qyWechatRedirect();//企业号
        } else {
            $this->mpWechatRedirect();//公众号
        }
    }
    
    public function actionTest()
    {
        var_dump(Yii::$app->redis->executeCommand('HGET', [$this->domainNameCacheKey, $this->getDomainName()]));
        var_dump($_COOKIE['staffid']);
        var_dump($_COOKIE['role']);
    }

    
    /**
     * 企业号授权回调
     * @param unknown $company_id
     * @param string $appid
     */
    public function actionRedirectCallback($company_id, $appid = '')
    {
        $url = $_GET['url'];
        $enterprise_data = $this->getEnterpriseQyWechat($company_id);
        if ($company_id == 'f00dfde1_4119_5556_b9e8_47174d7a55a9' && !empty($appid)) {
            $appidInfo = Yii::$app->redis->executeCommand('HGET', ['QyWechatSuiteOauthCallback', $appid]);
            $appidInfo = json_decode($appidInfo, true);
            $enterprise_data = $appidInfo['qywechat'];
        }
        if (isset($_GET['code']) && isset($enterprise_data['appid']) && $enterprise_data['appid']) {
            $wechat = new QiyeWechat($enterprise_data);
            $code = $_GET['code'];

            $userinfo = $wechat->getUserId($code, $enterprise_data['agentid']);

            if (isset($userinfo['UserId'])) {
                $getuserinfo = $wechat->getUserInfo($userinfo['UserId']);

                if (!empty($getuserinfo)) {
                    $sql = "select uid,type from {{%oauth}} where companyid=:companyid and weixinid=:weixinid and weixin_UserId=:weixin_UserId";
                    $param = array(
                        'companyid' => array($company_id),
                        'weixinid' => array(isset($getuserinfo['weixinid']) ? $getuserinfo['weixinid'] : ''),
                        'weixin_UserId' => array($userinfo['UserId']),
                    );
                    $rows = self::query($sql, $param, 'row', false);
                    if ($rows) {
                        if ($rows['type'] == 0) {
                            $sql = "select bid as staffid,0 as role,sid as store_id from {{%beautician}} where companyid=:companyid and bid=:bid";
                            $param = array(
                                'companyid' => array($company_id),
                                'bid' => array($rows['uid']),
                            );
                        } else {
                            $sql = "select aid as staffid,role,role_storeid as store_id from {{%admin}} where companyid=:companyid and aid=:aid";
                            $param = array(
                                'companyid' => array($company_id),
                                'aid' => array($rows['uid']),
                            );
                        }

                        $row = self::query($sql, $param, 'row', false);
                        $userInfo = [
                            'staffid' => $row['staffid'],
                            'role' => $row['role'],
                            'store_id' => $row['store_id'],
                            'company_id' => $company_id,
                        ];
                        $this->oauthLogined($userInfo, $this->cookiesDomain, true);
                    }
                }
            }
        }
        $this->redirect($url);

    }

    /**
     * 获取员工权限
     * @param string $role
     */
    public function getRole($role = false)
    {
        $array = [
            '2' => 'STORE_ASSISTANT',
            '3' => 'STORE_MANAGER',
            '5' => 'STORE_DIRECTOR',
            '6' => 'STORE_TECHNICIAN',
        ];

        return BaseActiveRecord::arrayDict($array, $role,'STORE_ASSISTANT');
    }


    //微信回调地址
    public function actionNotify()
    {
        if (isset($GLOBALS['HTTP_RAW_POST_DATA'])) {
            //使用通用通知接口
            $notify = new Wxpay_server_pub();

            //存储微信的回调
            $xml = $GLOBALS['HTTP_RAW_POST_DATA'];
            $notify->saveData($xml);

            //验证签名，并回应微信。
            //对后台通知交互时，如果微信收到商户的应答不是成功或超时，微信认为通知失败，
            //微信会通过一定的策略（如30分钟共8次）定期重新发起通知，
            //尽可能提高通知的成功率，但微信不保证通知最终能成功。
            if ($notify->checkSign() == false) {
                $notify->setReturnParameter("return_code", "FAIL"); //返回状态码
                $notify->setReturnParameter("return_msg", "签名失败"); //返回信息
            } else {
                $notify->setReturnParameter("return_code", "SUCCESS"); //设置返回码
            }
            // $s = $notify->checkSign() ? 'a' : 'b';
            // file_put_contents('../runtime/log.txt', $s);
            if ($notify->checkSign() == true) {
                if ($notify->data["return_code"] == "FAIL") {
                    //$log_->log_result($log_name,"【通信出错】:\n".$xml."\n");
                    // file_put_contents('./runtime/log.txt',"【通信出错】:\n".$xml."\n");
                } elseif ($notify->data["result_code"] == "FAIL") {
                    // $log_->log_result($log_name,"【业务出错】:\n".$xml."\n");
                    // file_put_contents('./runtime/log.txt',"【业务出错】:\n".$xml."\n");
                } else {
                    try {
                        // $connection = Yii::$app->db;
                        // $transaction = $connection->beginTransaction();

                        $orderno = $notify->data["out_trade_no"];

                        $oinfo = json_encode(array('waccount' => $notify->data['transaction_id']));
                        $callback = new Pay_callback();
                        $callback->callback_order($orderno, $oinfo, 'PAYTYPE_WECHATWEB');

                    } catch (\Exception $e) {
                        $transaction->rollBack();
                        // file_put_contents('../runtime/log.txt', $e);
                    }
                    //$log_->log_result($log_name,"【支付成功】:\n".$xml."\n");
                }
            }

            $returnXml = $notify->returnXml();
            // echo $returnXml;
            // file_put_contents('../runtime/log.txt', $xml);
            //exit;
        }
    }

    /**
     * 发送微信退款请求
     * 入参：订单id,实际退款金额（单位/元）
     * return:success
     * */
    public function Cancelorder($oid, $refundmoney = 0)
    {
        $classPath = Yii::getAlias("@common/components/wechat_pay_web/");


        include_once($classPath . "WxPayPubHelper.php");

        $sqlstr = "select * from {{%order}} where oid='" . $oid .
            "' and paytype='PAYTYPE_WECHATWEB'";
        $order = Yii::$app->db->createCommand($sqlstr)->queryOne();
        if (!$order) {
            $sqlstr = "select * from {{%order_replaceuser}} where orid='" . $oid .
                "' and paytype='PAYTYPE_WECHATWEB'";
            $order = Yii::$app->db->createCommand($sqlstr)->queryOne();
        }
        if (!$order)
            return '订单错误';

        $payinfo = json_decode($order['payinfo']);
        $out_trade_no = $order['orderno'];
        //退款金额
        $refund_fee = $order['actualprice'] * 100;
        if ($refundmoney != 0)
            $refund_fee = $refundmoney * 100;
        //商户退款单号，商户自定义，此处仅作举例
        $out_refund_no = $order['orderno'] . date('YmdHis');
        //总金额需与订单号out_trade_no对应，demo中的所有订单的总金额为1分
        $total_fee = $order['actualprice'] * 100; //使用退款接口
        $refund = new Refund_pub; //设置必填参数
        //appid已填,商户无需重复填写
        //mch_id已填,商户无需重复填写
        //noncestr已填,商户无需重复填写
        //sign已填,商户无需重复填写
        $refund->setParameter("out_trade_no", "$out_trade_no"); //商户订单号
        $refund->setParameter("out_refund_no", "$out_refund_no"); //商户退款单号
        $refund->setParameter("total_fee", "$total_fee"); //总金额
        $refund->setParameter("refund_fee", "$refund_fee"); //退款金额
        $refund->setParameter("op_user_id", WxPayConf_pub::MCHID); //操作员
        //非必填参数，商户可根据实际情况选填
        //$refund->setParameter("sub_mch_id","XXXX");//子商户号
        //$refund->setParameter("device_info","XXXX");//设备号
        //$refund->setParameter("transaction_id","XXXX");//微信订单号
        //调用结果
        $refundResult = $refund->getResult(); //商户根据实际情况设置相应的处理流程,此处仅作举例

        if ($refundResult["return_code"] == "FAIL") {
            echo "通信出错：" . $refundResult['return_msg'] . "<br>";
        } else {
            /* echo "业务结果：" . $refundResult[''] . "<br>";
             * echo "错误代码：" . $refundResult['err_code'] . "<br>";
             * echo "错误代码描述：" . $refundResult['err_code_des'] . "<br>";
             * echo "公众账号ID：" . $refundResult['appid'] . "<br>";
             * echo "商户号：" . $refundResult['mch_id'] . "<br>";
             * echo "子商户号：" . $refundResult['sub_mch_id'] . "<br>";
             * echo "设备号：" . $refundResult['device_info'] . "<br>";
             * echo "签名：" . $refundResult['sign'] . "<br>";
             * echo "微信订单号：" . $refundResult['transaction_id'] . "<br>";
             * echo "商户订单号：" . $refundResult['out_trade_no'] . "<br>";
             * echo "商户退款单号：" . $refundResult['out_refund_no'] . "<br>";
             * echo "微信退款单号：" . $refundResult['refund_idrefund_id'] . "<br>";
             * echo "退款渠道：" . $refundResult['refund_channel'] . "<br>";
             * echo "退款金额：" . $refundResult['refund_fee'] . "<br>";
             * echo "现金券退款金额：" . $refundResult['coupon_refund_fee'] . "<br>"; */
            if (!isset($refundResult['result_code'])) {
                if (!$this->Wechat_refundquery($order))
                    return '退款失败没有result_code';
            }
            if ($refundResult['result_code'] != 'SUCCESS') {
                if (!$this->Wechat_refundquery($order))
                    return '退款失败，请线下处理';
            }

            $oinfo = json_encode(array('refund_no' => $refundResult['refund_id'],
                'transaction_id' => $refundResult['transaction_id']));
            $this->updateorder($order, $oinfo);
            return 'success';
        }
        return '退款失败';
    }

    /**
     * 主动查询微信退款状态
     * * */
    public function Wechat_refundquery($order)
    {
        $classPath = Yii::getAlias("@common/components/wechat_pay_web/lib/");
        include_once($classPath . "WxPay.Api.php");
        $input = new \WxPayRefundQuery();
        $input->SetOut_trade_no($order['orderno']);
        $result = \WxPayApi::refundQuery($input);
        if ($result['return_code'] != 'SUCCESS')
            return false;
        if (!isset($result['refund_status_0']))
            return false;
        if ($result['refund_status_0'] == 'SUCCESS') {
            $oinfo = json_encode(array('refund_no' => $result['refund_id_0'],
                'transaction_id' => $result['transaction_id']));
            $res = $this->updateorder($order, $oinfo);
        }
        return false;
    }


    /**
     * 退款逻辑处理
     */
    public function updateorder($order, $oinfo)
    {
        try {
            $connection = Yii::$app->db;
            $transaction = $connection->beginTransaction();

            $sqlstr = "update {{%order}} set state='orderstate_refundsuccess' where oid='" .
                $order['oid'] . "' and  state='orderstate_waitrefund' ";
            $sqls = "update {{%order_replaceuser}} set state='orderstate_refundsuccess' where orid='" .
                $order['oid'] . "' and  state='orderstate_waitrefund'";
            $sqlr = "update {{%refundorder}} set paytime=" . time() . " , state=1,orinfo='" . $oinfo .
                "' where oid='" . $order['oid'] . "'";
            $conn = $connection->createCommand($sqlr)->execute();
            $conn = $connection->createCommand($sqls)->execute();
            $conn = $connection->createCommand($sqlstr)->execute();

            $transaction->commit();

            $baizdh = new Baidunonstop();
            $baizdh->Update_order($order['oid']);

            //发送退款成功消息通知给用户
            $content = self::getConfig('msg_user_refundsuccess', $order['companyid']);
            $sqlstr = "select mobile,nickname,companyid from {{%users}} where uid='" . $order['uid'] .
                "'";
            $user = Yii::$app->db->createCommand($sqlstr)->queryOne();
            if ($user) {
                $content = str_replace('{nickname}', $user['nickname'], $content);
                $status = Sms::send(['mobile' => $user['mobile'], 'msg' => $content, 'captcha' =>
                    '0', 'maxcount' => 20, 'companyid' => $user['companyid'], 'userid' => $order['uid'], 'accept_type' => 1]);
            }
            return true;
        } catch (\Exception $e) {
            $transaction->rollBack();
            //var_dump($e);exit;
            return false;
        }
        return false;
    }

    /**
     * 系统配置缓存
     *
     * @author     xiongyouliang
     * @param      key
     * @return     string
     */
    public function getConfig($key, $companyid)
    {
        $cache_c = Yii::$app->FileCache->get('config_' . $companyid);
        if (!$cache_c) {
            $cache_c = array();
            $sql = "SELECT * FROM {{%config}} where companyid='" . $companyid . "'";
            $data = Yii::$app->db->createCommand($sql)->queryAll();
            foreach ($data as $v) {
                $cache_c[$v['key']] = $v['val'];
            }
            Yii::$app->FileCache->set('config_' . $companyid, $cache_c);
        }
        $cache_0 = Yii::$app->FileCache->get('config_0');
        if (!$cache_0) {
            $cache_0 = array();
            $sql = "SELECT * FROM {{%config}} where companyid='0'";
            $data = Yii::$app->db->createCommand($sql)->queryAll();
            foreach ($data as $v) {
                $cache_0[$v['key']] = $v['val'];
            }
            Yii::$app->FileCache->set('config_0', $cache_0);
        }
        $cache = array_merge($cache_0, $cache_c);
        return isset($cache[$key]) ? $cache[$key] : "";
    }

}