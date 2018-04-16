<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<script>var SITEURL='';</script>
<title>操作提示</title>
<?php
use yii\helpers\Html;

$this->HeaderView();
?>
</head>
<body>

<table class="return-jump" border="0" cellspacing="0" cellpadding="0" width="" align="center">
    <thead>
        
        
        <tr>
            
            
          <th class="jump-title icon-no">错误提示：<br>
		  <b><?= Html::encode($name) ?></b></th>
        </tr>
    </thead>
    <tbody>
   <tr>       
        <td class="jump-content icon-yes">
		<p><?= nl2br(Html::encode($message)) ?></p></td>
   </tr>

  
        </tbody>
    
</table>


</body>
</html>
