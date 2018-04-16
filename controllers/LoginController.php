<?php
namespace appwechat\controllers;

use Yii;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;


use common\models\LoginForm;
/**
 * Site controller
 */
class LoginController extends \base\BaseController
{
	public $layout = false;


    /**
     * @inheritdoc
     */
    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],

            'captcha' => [
                'class' => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }




    public function actionLogout()
    {
        Yii::$app->user->logout();

        return $this->goHome();
    }

}
