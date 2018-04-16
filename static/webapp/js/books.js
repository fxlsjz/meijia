// JavaScript Document

/*放入书架*/
function addBookShelf(t, bid, bname, bpage_address, callback){
	if ($('.button-jia').hasClass('disabled')) return false;
	//$.cookie('BookShelf',null)
	var shelf = $.cookie('BookShelf');
	var v = {"bid":bid, "bname": bname, 'bpage_address': bpage_address};
	//var v = {"bid":bid, "bname": '<?php echo $info['bname']?>', 'bpage_address': '<?php echo $this->fullPath($info['bpage_address']);?>'};
	var is_shelf = false;
	if(!isnull(shelf)) {
		
		shelf = $.parseJSON(shelf);
		$.each(shelf, function(i, v){
			if(v.bid == bid) is_shelf = true;
		});
	}else{
		shelf = [];
	}

	//检查是否在书架
	if(t == 'check'){
		if (is_shelf){
			$('.button-jia').addClass('jian disabled').text('已加入书架');
		}
	}else{
		if ($('.button-jia').hasClass('jian')){//移除
			Xalert('已经在书架了', 1500);	
		}else{
			if (is_shelf){
				Xalert('已经在书架了', 1500);	
			}else{
				shelf.push(v);
				$.cookie('BookShelf', JSON.stringify(shelf), {expires: 365, path: '/'});
				if (callback){
					callback();
				}else{
				    $('.button-jia').addClass('jian disabled').text('已加入书架');
				}
				Xalert('放入书架成功', 1500);	
			}
		}
	}
	
}