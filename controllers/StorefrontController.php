<?php
namespace appwechat\controllers;

use Yii;

use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;


use yii\helpers\Url;
/**
 * Site controller
 */
class StorefrontController extends \appwechat\base\BaseFrontendController
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
				'ruleConfig' => ['class' =>  'appwechat\base\AccessRule'],
				'rules' => [
					 [
                        'actions' => ['pay'],
                        'allow' => true,
                        'roles' => ['?','@'],
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
	
	
	public function actionPay()
    {
        return $this->render('pay');
    }				
}
