<?php
defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');
defined('ROOT_PATH') or define('ROOT_PATH',dirname(__FILE__).'/');
defined('ROOT_DIR') or define('ROOT_DIR', dirname($_SERVER['SCRIPT_NAME']));
defined('IS_LOCAL') or define('IS_LOCAL', preg_match("/^(192.)|(127.)|(localhost)/A", $_SERVER["REMOTE_ADDR"]));
defined('IS_TESTING') or define('IS_TESTING', preg_match("/^(218|\w+)(.\w+)?\.(test.)?(([0-9]{3})\.([0-9]{3})|chinamobo.com)$/", $_SERVER['HTTP_HOST']));
defined('IS_READY') or define('IS_READY', preg_match("/^(\w+.)?(mdk.moxueyuan.net)$/", $_SERVER['HTTP_HOST']));

error_reporting(E_ALL);
require(__DIR__ . '/../vendor/autoload.php');
require(__DIR__ . '/../vendor/yiisoft/yii2/Yii.php');
require(__DIR__ . '/../common/config/aliases.php');
require(__DIR__ . '/../common/config/autoload.php');

$config = yii\helpers\ArrayHelper::merge(
    require(__DIR__ . '/../common/config/main.php'),
    IS_LOCAL ? require(__DIR__ . '/../common/config/main-local.php') : [],
    IS_TESTING ? require(__DIR__ . '/../common/config/main-test.php') : [],
    IS_READY ? require(__DIR__ . '/../common/config/main-ready.php') : [],
    require(__DIR__ . '/config/main.php'),
    IS_LOCAL ? require(__DIR__ . '/config/main-local.php') : []
);

$application = new yii\web\Application($config);
$application->language='zh-CH';
$application->run();
