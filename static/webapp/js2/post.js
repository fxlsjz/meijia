// JavaScript Document
/*审核屏蔽帖子*/
function check_post(forumid, postid, invisible){
    $.getJSON(returnUrl+'/Post/CheckPost', {forumid: forumid, postid: postid, invisible:invisible},function(data){
		if (data.result == 1){
			if (invisible == 0){
			    $('.check-post a:first', '#post-'+postid).addClass('uhide').siblings().removeClass('uhide');
				$('.subject', '#post-'+postid).removeClass('invisible-2');
			}else{
				$('.check-post a:last', '#post-'+postid).addClass('uhide').siblings().removeClass('uhide');
				$('.subject', '#post-'+postid).addClass('invisible-2');
			}
			Xalert('操作成功', 1000);
			if (invisible == 9){
			    setTimeout(function(){
					href(returnUrl+'/Post/Postlist?forumid='+forumid);
				},1000);	
			}
		}else{
			Xalert(data.msg, 1500);
		}
	});
}

/*审核屏蔽帖子*/
function check_reply(forumid, replyid, invisible){
    $.getJSON(returnUrl+'/Post/CheckReply', {forumid: forumid, replyid: replyid, invisible:invisible},function(data){
		if (data.result == 1){
			if (invisible == 0){
			    $('.check-post a:first', '#reply-'+replyid).addClass('uhide').siblings().removeClass('uhide');
				$('.content', '#reply-'+replyid).removeClass('invisible-2');
				$('.check-tips', '#reply-'+replyid).addClass('uhide');
			}else{
				$('.check-post a:last', '#reply-'+replyid).addClass('uhide').siblings().removeClass('uhide');
				$('.content', '#reply-'+replyid).addClass('invisible-2');
				$('.check-tips', '#reply-'+replyid).removeClass('uhide');
			}
			Xalert('操作成功', 1000);
		}else{
			Xalert(data.msg, 1500);
		}
	});
}

// 元素失去焦点隐藏iphone的软键盘
function objBlur(id,time){
    if(typeof id != 'string') throw new Error('objBlur()参数错误');
    var obj = document.getElementById(id),
        time = time || 300,
        docTouchend = function(event){
            if(event.target!= obj){
                setTimeout(function(){
                     obj.blur();
                    document.removeEventListener('touchend', docTouchend,false);
                },time);
            }
        };
    if(obj){
        obj.addEventListener('focus', function(){
            document.addEventListener('touchend', docTouchend,false);
        },false);
    }else{
        throw new Error('objBlur()没有找到元素');
    }
}
