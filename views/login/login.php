<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <script type="text/javascript" src="../static/common/js/jquery-1.7.1.min.js">
        var password = request('music');
        </script>
        <title>
            <?php echo Yii::$app->
                name;?>-登录
        </title>
        <link href="../static/common/css/admin-login.css"
        type="text/css" rel="stylesheet">
    </head>
    
    <body onkeydown="keylogin();" style="margin:0;">
        <div class="wraper">
            <div id="background" style="position:absolute;z-index:-1;width:100%;height:100%;top:0px;left:0px; background-color:#D6DEE0">
            </div>
            <div class="login-bg">
                <div class="login-dl-left">
                </div>
                <div class="login-dl-right">
                </div>
                <div class="login-dl">
                    <div class="project-m">
                        <span class="c-616161">
                            后台管理系统
                        </span>
                    </div>
                    <?=$this->
                        csrfToken()?>
                        <div class="login_input">
                            <div class="user-in">
                                <span>
                                    用户名：
                                </span>
                                <div class="text-k">
                                    <input type="text" id="username" name="LoginForm[username]" class="text-in">
                                </div>
                            </div>
                            <div class="user-in">
                                <span>
                                    密&nbsp;&nbsp;码：
                                </span>
                                <div class="text-k">
                                    <input type="password" id="password" name="LoginForm[password]" class="text-in">
                                </div>
                            </div>
                            <div class="tip_wrong" id="tip_wrong">
                            </div>
                            <div class="text-bu ">
                                <input type="button" id="submit" name="" class="login-in">
                                <input name="LoginForm[rememberMe]" type="checkbox" value="1" style=" border:1px solid #a7b6c4; margin:0 5px; "
                                id="rememberMe" />
                                <font class="forget-pwd">
                                    记住密码
                                </font>
                            </div>
                        </div>
                </div>
            </div>
        </div>
        <script type="text/javascript">
            if (window.top != window.self) {
                window.parent.location.reload();
            }

            function keylogin() {
                if (event.keyCode == 13) {
                    $("button").click();
                }

            }

            //回车提交事件
            $('#submit').click(function() {});
            $("body").keydown(function() {
                if (event.keyCode == "13") { //keyCode=13是回车键
                    $('#submit').click();
                }
            });

            $(function() {

                $('#submit').click(function() {

                    $rememberMe = $('#rememberMe').prop('checked') ? 1 : 0;
                    if ($('#username').val() == "") {
                        $('#tip_wrong').html("* 用户名不能为空");
                    } else if ($('#password').val() == "") {
                        $('#tip_wrong').html("* 密码不能为空");
                    } else {
                        var url = '<?php echo $this->createUrl('login/index');?>';
                        var data = {
                            '_csrf': $('#_csrf').val(),
                            'LoginForm[username]': $('#username').val(),
                            'LoginForm[password]': $('#password').val(),
                            'LoginForm[verifyCode]': $('#verifyCode').val(),
                            'LoginForm[rememberMe]': $rememberMe
                        };
                        $.post(url, data,
                        function(data) {
                            if (data.state == 'error') {
                                $('#tip_wrong').html(data.msg);
                            } else {
                                /* var companyId = data*/
                                /*window.location.href = "<?php echo $this->createUrl('index/index');?>";*/
                            }
                        },
                        'json');
                    }
                });

            });
        </script>
    </body>

</html>