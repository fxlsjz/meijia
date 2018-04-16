<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<title>&nbsp;</title>
<?php echo $this->render('/_include/_header');?>
<script type="text/javascript">
	var param = {};
	var pageNo = 1;
	var m = /^1\d{10}$/;
	var identification = <?php echo $this->context->identification(['MO2O_APP_GET_SECODE','MO2O_APP_LOGIN_SYSTEM'])?>;
	function loaded () {

}
/*function return_goback(){
	Xalert('请登录',1000);
	return false;
}*/

</script>
</head>

<body>
<div class="header-fixed">
  <header>
    <div class="btn-return ub-img5" onClick="goback();"></div>
    <h1><span onClick="location.reload();"><!-- 手机 -->登录</span></h1>
  </header>
</div>
<div class="page">
  <div class="login-padd">
    <div class="ub send-get">
      <div class="ub-f1">
        <input class="text ulev-1" id="mobile" type="number" style="border-width: 1px; border-color:#ccc;outline: none; border-radius:0 ;height:auto" placeholder="手机号" onkeyup="this.value=this.value.replace(/\D/g,'')"  onafterpaste="this.value=this.value.replace(/\D/g,'')" maxlength="11" />
      </div>
      <input type="button" value="获取验证码" class="ulev-1"  id="getverify">
    </div>
    <div class="ub">
      <input type="number" class="ulev-1 ub" id="se_code" style="outline: none;border-radius:0;height:auto"placeholder="验证码"  onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')">
    </div>
    <div >
    <input type="checkbox" style="display: none;" value="" />
    <div class="u-check u-check-cur" style="top:50%;margin-top: -0.5em;"></div>
    <p style="margin-left: 2em;" class="ulev-3">我已阅读并同意</p>
    <p onClick="href('<?php echo $this->createUrl('index/copy_service')?>?id=1')" class="c-d4b98c ulev-3 c-E64C65">《用户使用协议》</p>
    </div>
  </div>
	<div class="ub margin-t-12 tx-middle" id="submit-bot"> <font class="c-d4b98c c-fff"><!-- 点击登录 -->确定</font> </div>
</div>
<?php echo $this->render('/_include/_footer');?>
<script>
var cookiesDomain = document.domain;

function time(){
	if(wait == 0){
		$('#getverify').removeAttr('disabled');
		$('#getverify').val('重新获取');
		$('#getverify').css('background','#F8F8F8');
	}else{
		$('#getverify').attr('disabled','disabled');
		var _res = setTimeout(function(){
			$('#getverify').val(wait+'秒');
			wait--;
			time();
			},1000);
		}
	}
	$('#getverify').click(function(){
		var mobile = $('#mobile').val();
		if (mobile ==''){
			Xalert('请输入手机号', 1000);
			return false;
		}
		if (!m.test(mobile)){
			Xalert('手机号输入有误，请重试', 1000);
			return false;
		}
		param = {into: 3.2,mobile:mobile,service_code:'MO2O_APP_GET_SECODE'};
		getData({
			extend_userinfo:false,
			data: param,
		},function(data){

			if (data.error_code == 200){
				Xalert('验证码发送成功',1000);
				wait = 60;
				time();
			}else{
				if (mobile ==''){
					Xalert('请输入手机号', 1000);
					return false;
				}
			  Xalert(data.error_msg,1000);
			}
		});
	});


/*提交*/
	$('#submit-bot').click(function(){
		var openid=$.cookie('openid');
		var wechatname=$.cookie('wechatname');
		var mobile = $('#mobile').val();
		var se_code = $('#se_code').val();
		if (mobile ==''){
			Xalert('请输入手机号', 1000);
			return false;
		}
		if (mobile =='' || !m.test(mobile)){
			Xalert('手机号输入有误，请重试', 1000);
			return false;
		}
		if (se_code == ''){
		Xalert('请输入验证码', 1000);
		return false;
		}
		if (!$(".u-check").hasClass("u-check-cur")){
			return false;
		}
		var param = {into: 3.1,service_code:'MO2O_APP_LOGIN_SYSTEM',sys_model:'',sys_version:'',mobile: mobile, se_code: se_code, openid:openid, wechatname:wechatname};
		getData({
			extend_userinfo:false,
			data: param,
		},function(data){

			if(data.status =='N'){
				Xalert(data.error_msg, 1000);
				return false;
			}
			if(data.status =='Y'){
			Xalert('登录成功', 1000);
			$.cookie('login',JSON.stringify(data.results) , { expires: 365, path: '/'});
			var nowTime =new Date().getTime()/1000;
			var param = {
				value_md5:'',
				service_code:'FM_APP_SET_VALUE',
				user_id:'', 
				token:'',
				device_type:'wechat',
				language:'zh_CN',
				version:'1.0',
//				company_id:'f00dfde1_4119_5556_b9e8_47174d7a55a9',
				time_stamp:nowTime
			};
			
			getData({
				extend_userinfo:false,
				data: param,
			},function(data){
				if(data.status =='N'){
					Xalert(data.error_msg, 1000);
					return false; 
				}
				if(data.status =='Y'){	
					for(var i=0; i < data.results.res_value.length; i++){
						if(data.results.res_value[i].dic_code == 'COMPANY_MODEL'){
							var value = data.results.res_value[i].dic_desc;
							if(value =='SYSTEM_O2O'){
								console.log('一期');
								//登录入口直接进
							   /*setTimeout(function(){
									var url = '<?php echo $this->createUrl('my/index')?>';
					             	href(url);
								},1000);*/
										 
								// setTimeout(function(){
								// 	  //返回并刷新当前页面 
								// 	self.location=document.referrer;
								// },1000);
								var index="<?php echo isset($_GET['index'])?$_GET['index']:''; ?>";
								if( index == 'index'){
								   setTimeout(function(){
										var url = '<?php echo $this->createUrl('index/index')?>';
						             	href(url);
									},1000);		
								}	
								else{			 
									setTimeout(function(){
										  //返回并刷新当前页面 
										self.location=document.referrer;
									},1000);
								}
								return;
							}
							
							if(value =='SYSTEM_SHOP'){
								console.log('二期');
								var host ='http://'+ location.href.split('/')[2];
								location.href = host + '/tab/home';
								return;
							}
							if(value =='SYSTEM_SHOP_O2O'){
								console.log('混合模式');
								var host ='http://'+ location.href.split('/')[2];
								location.href = host + '/tab/home';
								return;
							}
							
						}
					}
				}
			})
			  
	            	
					
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			 
				
			}
		});	
	});
	$(function(){
		loaded();
		//Dbug(1);
		$("input[type=number]").blur(function(){
			$(this).css("border-color","#ccc")
		})
		$("input[type=number]").focus(function(){
			$(this).css("border-color","#E64C65")
		})
		$(".u-check").click(function(){
			$(this).toggleClass("u-check-cur")
		})
		$(".u-check").click(function(){
	
			if(!$(".u-check").hasClass("u-check-cur")){
				$(".tx-middle").css("background","#F3A6B3")
			}else{
				$(".tx-middle").css("background","#E64C65")
			}
			
		})
	});
	
</script>
</body>
</html>
