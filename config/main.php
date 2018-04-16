<?php
$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    IS_LOCAL ? require(__DIR__ . '/../../common/config/params-local.php') : [],
    require(__DIR__ . '/params.php'),
    IS_LOCAL ? require(__DIR__ . '/params-local.php') : []
);

return [
    'id' => 'app-appwechat',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
	'defaultRoute' => 'index',
    'controllerNamespace' => 'appwechat\controllers',
	
    'components' => [
		'user' => [
			'identityClass' => 'common\models\User',
			'enableAutoLogin' => true,
// 			'loginUrl' => ['index/login', 'company_id'=> isset($_GET['company_id']) ? $_GET['company_id'] : ''],
		],
	    'submodel'=> [
            'class' => 'submodule\base\BaseSubmodel',
        ],
		'view' => [
            'class' => 'submodule\base\BaseSubmoduleView',
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            /*'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],*/
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
    ],
	'modules' => [],
    'params' => $params,
];
