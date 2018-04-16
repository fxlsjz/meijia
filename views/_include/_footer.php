
<?php if(isset($button)){?>
<div id="footer" class="ub tab t-wh tx-middle">
  <ul class="ub">
  	
    <input class="uhide" type="radio" name="tabSwitch" id="index" <?php echo $button ==1 ? ' checked' : ''?>>
    <div class="menu-width ub-pc ub tab-act tx-c ub-f1" onClick="zy_for(event);service();href('<?php echo $this->createUrl('index')?>?code=11')">
      <div>首页</div>
    </div>
    
    <input class="uhide" type="radio" name="tabSwitch" id="service" <?php echo $button ==2 ? ' checked' : ''?>>
    <div class="menu-width ub-pc ub tab-act tx-c ub-f1 u-service" onClick="zy_for(event);service();href('<?php echo $this->createUrl('service/index')?>')">
      <div>服务</div>
    </div>
    
    <input class="uhide" type="radio" name="tabSwitch" id="beautician" <?php echo $button ==3 ? ' checked' : ''?>>
    <div class="menu-width ub-pc ub tab-act tx-c ub-f1 u-beautician" onClick="zy_for(event);service();href('<?php echo $this->createUrl('beautician/index')?>')">
      <div>技师</div>
    </div>
    
    <input class="uhide" type="radio" name="tabSwitch" id="order" <?php echo $button ==4 ? ' checked' : ''?>>
    <div class="menu-width ub-pc ub tab-act tx-c ub-f1 u-order" onClick="zy_for(event);service();href('<?php echo $this->createUrl('order')?>')">
      <div>订单</div>
    </div>
    <input class="uhide" type="radio" name="tabSwitch" id="mall" <?php echo $button ==6 ? ' checked' : ''?>>
    <div class="menu-width ub-pc ub tab-act tx-c ub-f1 u-mall" style="display: none !important;" onClick="zy_for(event);goTo2('/tab/mall')">
      <div>商城</div>
    </div>
    
    <input class="uhide" type="radio" name="tabSwitch" id="my" <?php echo $button ==5 ? ' checked' : ''?>>
    <!--<div class=" menu-width ub-pc ub tab-act tx-c ub-f1" onClick="zy_for(event);service();href('<?php echo $this->createUrl('my')?>')">-->
    	<div class=" menu-width ub-pc ub tab-act tx-c ub-f1" onClick="zy_for(event);selectGoto2()">
      <div>我的</div>
    </div>
  </ul>
</div>
<?php
}
?>

<script type="text/javascript">
$('#index').click(function(event) {
  /* Act on the event */
  zy_for(event);
  service();
  href('<?php echo $this->createUrl('index')?>')
});

var user_identification = <?php echo $this->context->identification(['MO2O_APP_USER_INFO'])?>;
identification= $.extend({}, typeof(identification) == 'object' ? identification : {},user_identification);
</script>

<script type="text/javascript">
function service(){
	$.cookie('service_selected','' , { expires: 365, path: '/' });
	$.cookie('selected_others','' , { expires: 365, path: '/' });
	$.cookie('time_val','' , { expires: 365, path: '/' });
	$.cookie('beauInfo','' , { expires: 365, path: '/' });
	$.cookie('selected_beau','' , { expires: 365, path: '/' });
	$.cookie('selected_beauTwo','' , { expires: 365, path: '/' });
	$.cookie('addressInfo','' , { expires: 365, path: '/' });
	$.cookie('address','' , { expires: 365, path: '/' });
	$.cookie('info','' , { expires: 365, path: '/' });
}
</script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/iscroll-probe.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/jquery-1.10.2.min.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/iscroll-pull.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/jquery.cookie.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/iscroll.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js2/swipeSlide.js"></script>

<script type="text/javascript">
$(function(){
$(".u-order,.u-service").remove();
$(".u-mall").show();

})
function selectGoto2(){
	if(companyType == 'SYSTEM_SHOP_O2O'){
		goTo2('/tab/my')
	}else{
		href('<?php echo $this->createUrl('my')?>')
	}
}
function goTo2(key){
	var host =  'http://' + window.location.href.split('/')[2]+ key;
	window.location.href = host
}
/*function get_userse(){
	var param = {into:3.3,service_code:'MO2O_APP_USER_INFO'};
	getData({
		data: param,
	},function(data){
	   if(data.status!='Y'){
	   	alert(1)
			var url = '<?php echo $this->createUrl('my')?>';
	     href(url);
	   }
	});	
}*/

</script>





