/*所在地选择*/
function select_city(parentid, c, type){
	$('#city-list').removeClass('uhide').siblings().addClass('uhide');
	$('.right-experience').addClass('uhide');
	var div = '.city-list';
	if (!c){
		 city = [];
		 cityid = [];
		 parentids = [];
		 $(div).last().html('');
		 $('#sidebar #header h1').text(type=='city' ? '所在地' : '请选择部门');
		 $(window).scrollTop(0);
		 Nback.back = true;
	}else{
			
	}
	parentids.push(parentid);
	if (parentid == 0) Nback.back = true;
	$('body').css('overflow','hidden');
	$('#sidebar').removeClass('close').addClass('open');
	navScroll.refresh();
	getData({
		div: div,
		url: returnUrl+'/User/'+type,
		data: {parentid: parentid || 0},
		Scroll: navScroll
	},function(data){
		setTimeout(function(){
		$('.city-list:last li').on('click', function(){
			var pid = $(this).attr('id');
			var depth = parseInt($(this).attr('depth'));
			
			cityid[depth] = pid;
			city[depth] = $(this).text();
			var chileren = $(this).attr('chileren');
            var parid = parentids[depth];
			
				Nback.back = false;
				Nback.index = depth;
				Nback.action[depth] = function(){
					$(div).last().html('');
					Nback.index--;
					select_city(parid, parid == 0 ? false : true, type);
				}
			if (chileren == '1'){
				$(div).last().html('');
				
				select_city(pid, true, type);
			}else{
				$(div).last().html('');
				if (type == 'city'){
				    $('#locality_text').text(city.join(' '));
				    $('#locality').val(','+cityid.join(',')+',');
				}else{
					$('#sign_text').text($(this).text());
				    $('sign').val($(this).text());
				}
				$('#sidebar').addClass('close').removeClass('open');
				$('body').css('overflow','auto');
			}
		});
		},250);
		//navScroll.refresh();
	});
}