'use strict';

/*
通用的filter类
 author huoyuanyuan
 date 2016/9/23
 */
app.filter("imgUrl", function() {
    var filterfun = function(str) {
        return str.replace('mxy.com', 'mxy.chinamobo.com');
    };
    return filterfun;
});


app.filter("backgroundImg", function() {
    var bg = function(str) {
        return str ? 'background-image: url('+str+')' : '';
    };
    return bg;
});

app.filter("T", ['localization', function($translate) {
    return function(key) {
        if(key){
            return $translate.zh_CN[key];
        }
    };
}]);