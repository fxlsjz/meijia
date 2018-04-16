/*!
 * touchDate v1.0 
 * 解决webapp 上触摸选择时间控件
 * 作者 xiongyouliang@gmail.com
 * 
 * Copyright 2011-2013, xiongouliang
 *
 * 请尊重原创，保留头部版权
 * 在保留版权的前提下可应用于个人或商业用途
 */
(function($) {
    // 参数选项设置
	var today= new Date();
    var defaults={
			year_touch: $('#select-date .year li'),
			month_touch: $('#select-date .month li'),
		    day_touch: $('#select-date .day li'),
			callback: null,
			year: today.getFullYear(),
			month: today.getMonth()+1,
			day: today.getDate(),
			max_year: today.getFullYear()+10,
			min_year: today.getFullYear()-100,
			max_time : Math.round(new Date().getTime() / 1000),
			min_time : Math.round(new Date().getTime() / 1000) - 365*24*60*60*100,
			init: null,
			events: 'click'
			
			
	};
	
	$.fn.touchdate = function(options){

		var getweek = function(d){
			var week;
			if (!d) d = new Date();
			if(d.getDay()==0)          week="周日"
			if(d.getDay()==1)          week="周一"
			if(d.getDay()==2)          week="周二"
			if(d.getDay()==3)          week="周三"
			if(d.getDay()==4)          week="周四"
			if(d.getDay()==5)          week="周五"
			if(d.getDay()==6)          week="周六"
			return week;
		}

		var opts = $.extend({},defaults,options);
		var t = this;
		
		if (opts.init){
			var date = opts.year+'-'+opts.month+'-'+opts.day;
			var w = getweek(new Date(date)); 
			opts.init({year:opts.year, month:opts.month, day:opts.day, week:w});
		}
		
		var maxmin = function(m, t){
			var time = Unix2Time(m == 'max' ? opts.max_time : opts.min_time, 1000);
			var v = 0;
			if (t == 'y'){
				v = time.getFullYear();
			}else if (t == 'm'){
				v = time.getMonth()+1;
			}else if (t == 'd'){
				v = time.getDate();
			}
			return parseInt(v);
			
		}
		this.show = function(){
			var html = '<div id="select-date">\n\
			<div class="content-date">\n\
			<div class="box">\n\
			<div class="title t-wh ulev1"><span id="date">2014-06-31 周二</span></div>\n\
			<div class="dates ub-pc ub f-yh">\n\
			<ul class="year">\n\
			<li><span>＋</span></li>\n\
			<li><span id="year">2014</span></li>\n\
			<li><span>－</span></li>\n\
			</ul>\n\
			<ul class="month">\n\
			<li><span>＋</span></li>\n\
			<li><span id="month">05</span></li>\n\
			<li><span>－</span></li>\n\
			</ul>\n\
			<ul class="day">\n\
			<li><span>＋</span></li>\n\
			<li><span id="day">22</span></li>\n\
			<li><span>－</span></li>\n\
			</ul>\n\
			</div>\n\
			<div class="bottom ub-pc ub c000 c-m4"><h1 id="date_return" class="ulev1 c-m2 c555">完成</h1></div>\n\
			\n\
			</div>\n\
			</div>\n\
			\n\
			</div>';
			($('#select-date').length>0) ? $('#select-date').show() : $('body').append(html);
			$('#select-date #year').text(opts.year);
			$('#select-date #month').text(opts.month);
			$('#select-date #day').text(opts.day);
			t.Setdate();
			
			//$('#select-date .year li').unbin(opts.events);
			$('#select-date .year li').unbind(opts.events).on(opts.events, ChangeYear);
			
			function ChangeYear(event){
				event.preventDefault();
				
				var jia = $('#select-date .year li').index(this);
				var max_year = maxmin('max', 'y');
				var min_year = maxmin('min', 'y');
				var y = parseInt($('#select-date #year').text());
				var m = parseInt($('#select-date #month').text());
				var d = parseInt($('#select-date #day').text());
				var yy = jia==0 ? y+1 : y-1;
				if (yy < min_year) yy = min_year;
				
				
				if (yy > max_year) yy = max_year;
				
				$('#select-date #year').text(yy);
				var day2 = new Date(yy, m, 0).getDate();
				if (d > day2) $('#select-date #day').text(day2);
				//t.CheckDate(yy, m, d);
				t.Setdate(this);
			};
			
			
			//$('#select-date .month li').unbin(opts.events);
			$('#select-date .month li').unbind(opts.events).on(opts.events, ChangeMonth);
			function ChangeMonth(event){
				event.preventDefault();
				
				var jia = $('#select-date .month li').index(this);
				var y = parseInt($('#select-date #year').text());
				var m = parseInt($('#select-date #month').text());
				var d = parseInt($('#select-date #day').text());
				var mm = jia==0 ? m+1 : m-1;
				if (mm>12){
					 y++;
					 mm = 1;
				}
				if (mm<1) {
					y--;
					mm = 12;
				}
				
				var date = Math.round(new Date(y+'-'+mm+'-'+d).getTime() / 1000);
				//alert(Unix2Time(date, 1000, 1));
				if (date > opts.max_time || date < opts.min_time){
					return false;
				}
				
				t.Set(y, mm, d);
				return false;
				
				/*if (y <= opts.year){
					if (mm <= opts.month) mm = opts.month;
				}*/
				
				
				if (mm>12){
					var yy = (yy >= opts.year) ? opts.year : y+1;
					$('#select-date #year').text(yy);
					mm = 1;			 
				}
				
				if (mm<1){
					var yy = (yy <= opts.year) ? opts.year : y-1;
					$('#select-date #year').text(yy);
					mm = 12;			 
				}
				
				var day2 = new Date(y, mm, 0).getDate();
				d = parseInt($('#select-date #day').text());
				if (d>day2) $('#select-date #day').text(day2);
				
				$('#select-date #month').text(mm);
				t.Setdate(this);
			}
			
			
			//$('#select-date .day li').unbin(opts.events);
			$('#select-date .day li').unbind(opts.events).bind(opts.events, ChangeDay);
			function ChangeDay(event){
				event.preventDefault();
				var jia = $('#select-date .day li').index(this);
				var y = parseInt($('#select-date #year').text());
				var m = parseInt($('#select-date #month').text());
				var d = parseInt($('#select-date #day').text());
				var dd = jia==0 ? d+1 : d-1;
				var day2 = new Date(y, m, 0).getDate();
				
				
				if (dd>day2){//本月最后一天
					
					
					if(m > 12){
						if (y < opts.max_year){
							y = y+1;
							dd = 1;
						}
					}else{
						m = m+1;
						dd = 1;
					}
				}
				
				if (dd<1){
					m = m -1;
					
					day2 = new Date(y, m, 0).getDate();
					if (m < 1){
						if (y > opts.year){
							y = y-1;
						    dd = day2;
							m = 12;
						}
					}else{
						 dd = day2;
						 
					}
	
				}
				dd = dd<=1 ? 1 : dd;
				var date = Math.round(new Date(y+'-'+m+'-'+dd).getTime() / 1000);
				//alert(Unix2Time(date, 1000, 1));
				if (date > opts.max_time || date < opts.min_time){
					return false;
				}
				
				t.Set(y, m, dd);
				return false;
				
				
				if (y <= opts.year){
					if (m <= opts.month && dd<opts.day) dd = opts.day;
				}
				
				var yy = y;
				var mm = m;
				
				var day2 = new Date(y, m, 0).getDate();
				
				
				if (dd>day2){//本月最后一天
					
					
					if(mm > 12){
						if (y < opts.max_year){
							yy = y+1;
							dd = 1;
						}
					}else{
						mm = m+1;
						dd = 1;
					}
				}
				
				if (dd<1){
					mm = m -1;
					
					day2 = new Date(y, mm, 0).getDate();
					if (mm < 1){
						if (y > opts.year){
							yy = y-1;
						    dd = day2;
							mm = 12;
						}
					}else{
						 dd = day2;
						 
					}
	
				}
				
				$('#select-date #year').text(yy);
				$('#select-date #month').text(mm);
				dd = dd<=1 ? 1 : dd;
				$('#select-date #day').text(dd);
				t.Setdate(this);
			}
			
			$('#select-date #date_return').unbind(opts.events).on(opts.events,function(event){
				t.Destroy();
				if(opts.callback) opts.callback(t.getVal());
				$('#select-date').hide();
				
				//$(this).unbind('tap');
			});
		}
		
	   t.addZero = function(str){              
			return (parseInt(str) >= 10) ? str : '0' + str;
		}

       t.Destroy = function(){
		   //Xalert('Destroy', 500);
		   $('#select-date .year li').unbind(opts.events);
		   $('#select-date .month li').unbind(opts.events);
		   $('#select-date .day li').unbind(opts.events);
		   
	   }
	   
	   t.CheckDate = function(y, m, d){
		   if (y > opts.max_year) y = opts.max_year;
		   if (y < opts.year) y = opts.year;
		   
		   if (m < opts.month) m = opts.month;
		   
		    if (d < opts.day) m = opts.day;
			
			var max_d = new Date(y, m, 0).getDate();
			if (d > max_d) d = max_d;
			return {year:y, month:m, day:d};
	   }
	   
	   t.setVal = function(data){
		   $('#select-date #year').text(data.year);
		   $('#select-date #month').text(data.month);
		   $('#select-date #day').text(data.day);
		   t.removeClass('_loading');
	   }
	   
       t.getVal = function(){
		    var y = parseInt($('#select-date #year').text());
			var m = parseInt($('#select-date #month').text());
			var d = parseInt($('#select-date #day').text());
			var date = y+'-'+m+'-'+d;	
			var w = getweek(new Date(date));
		    var data = {year:y, month:m, day:d, week: w};
			return data;
		}
		
		
		
		t.Setdate = function(obj){
			var val = t.getVal();
			var date = val.year+'-'+val.month+'-'+val.day;
			$('#select-date #date').text(date+' '+val.week);
			return false;
			//if (obj) $(obj).unbind('tap');
		}
		
		t.Set = function(y, m, d){
			$('#select-date #year').text(y);
			$('#select-date #month').text(m);
			$('#select-date #day').text(d);
			var date = y+'-'+m+'-'+d;
			$('#select-date #date').text(date);
			return false;
			//if (obj) $(obj).unbind('tap');
		}
		

        t.unbind(opts.events).on(opts.events,function(){
			//$(this).unbind('tap');
			//if(t.hasClass('_loading')) return false;
			//t.addClass('_loading');
		    t.show();
		});
		
	}
    
})(jQuery);
