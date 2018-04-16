
<link href="<?php echo $this->root_dir;?>/static/webapp/css/common.css" type="text/css" rel="stylesheet">

<link href="<?php echo $this->root_dir;?>/static/webapp/css/ispa_new.css" type="text/css" rel="stylesheet">
<link href="<?php echo $this->root_dir;?>/static/webapp/css/red_style.css" type="text/css" rel="stylesheet">

<link href="<?php echo $this->root_dir;?>/static/webapp/css1/common1.css?cod=009" type="text/css" rel="stylesheet">
<link href="<?php echo $this->root_dir;?>/static/webapp/css1/ispa_new1.css" type="text/css" rel="stylesheet">
<link href="<?php echo $this->root_dir;?>/static/webapp/css1/lunbo.css" type="text/css" rel="stylesheet">

<script type="text/javascript">
var root_dir = '<?php echo $this->root_dir?>';
//var company_id = "<?=isset($_GET['company_id']) ? $_GET['company_id'] : ''?>";
</script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js2/jquery-2.0.3.min.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js2/jquery.cookie.js"></script>
<!-- <script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js2/swipeSlide.js"></script> -->
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/md5.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/common.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/template.js"></script>
<script type="text/javascript" src="<?php echo $this->root_dir;?>/static/webapp/js/tools.js"></script>
<script type="text/javascript">
var BoxShareData = {
	//成功回调函数名，经过测试and6.5以上微信分享success可用，ios可用
	successcallback: "onSuccess",
	//失败回调函数名，android6.5及其以下分享fail均不可用
	errorcallback: "onFail",
	options: {
		//分享类型是网址分享
		type: 'url',
		//内容
		content:"iSpa，真正的五星级到家服务，传承30家国际五星级店面iSpa服务理念，超越平凡，献给最独特的你。",
		iconUrl: "http://app.ispa.cn/static/webapp/images/icon.png",
		//分享的url
		//linkUrl: "http://po.m.baidu.com/act/avengers/index.html"
		linkUrl:window.location.href,
		//分享的面板，一般是all，全面版
		mediaType: "all",
		title: "iSpa"
	}
}
</script>
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "//hm.baidu.com/hm.js?497e4bb98b2285605c1d5b15a2b5097e";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>