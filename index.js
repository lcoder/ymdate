/**
 * Created by maotingfeng on 16/7/27.
 */
(function( factory ){
    var md = typeof define == "function" ;
    if( typeof module === 'object' && typeof module.exports === 'object' ){
        module.exports = factory() ;
    }else if( md && define.amd ){
        define( ['require','jquery'] , factory ) ;
    }else if( md && define.cmd ) {
        define( 'ymdate' , ['jquery'] , factory ) ;
    }else{
        factory( function(){ return window.jQuery } ) ;
    }
})(function( require ){
    var $ = require('jquery') ,
        _cache = {} ,
        tool = {
            guid: function(){
                function S4() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                };
                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()) ;
            } ,
            padNumber: function(num, fill) {
                //改自：http://segmentfault.com/q/1010000002607221
                var len = ('' + num).length;
                return (Array(
                    fill > len ? fill - len + 1 || 0 : 0
                ).join(0) + num);
            } ,
            checkYmdate: function( value ) {
                var ymdateReg = /^\d{4}(-|\/)\d{1,2}$/g ;
                return ymdateReg.test( value ) ;
            }
        } ;
    function ymdate( config ){
        var $this = $( this ) ,
            isBind = false ,
            $document = $( document ) ,
            _clicks = $._data( $document[0] , "events" ) ,
            clicks = _clicks && _clicks.click ,
            _config = $.extend( { onpicked: $.noop } , config ) ;   // 用户配置参数
        // 设置
        this._ymdate = { config: _config , isUptonow: false };
        $this.on( "click" , function( ev ){
            showDatePanel.call( this ) ;
            ev.stopPropagation() ;
        } ) ;
        // 点击其他区域 日期消失
        if( clicks ){
            $.each( clicks , function( index , val ){
                if( val.namespace == "ymdate" ){
                    isBind = true ;
                }
            } ) ;
        }
        if( isBind ){}
        else{
            $document.on( "click.ymdate" , function( ev ){
                var $target = $( ev.target ) ;
                if( $target.closest(".ymdate_layer").length > 0 ){}
                else{
                    $.each( $.data( _cache ) , function( guid , $ymdate_layer ){
                        $ymdate_layer.remove() ;
                        $.removeData( _cache , guid ) ;
                    } ) ;
                }
            } ) ;
        }
    } ;
    function showDatePanel(){
        var that = this ,
            $input = $( this ) ,
            originalValue = $.trim( $input.val() ) ,
            $body = $("body") ;
        if( originalValue == "至今" ){
            $.extend( that._ymdate , { isUptonow: true } ) ;
            that._ymdate.year = undefined ;
            that._ymdate.month = undefined ;
        }else if( tool.checkYmdate( originalValue ) ){
            var originalValueArr = originalValue.replace(/\//g,"-").split("-") ;
            that._ymdate.year = originalValueArr[0] ;
            that._ymdate.month = originalValueArr[1] ;
        }else{
            $.extend( that._ymdate , { isUptonow: false } ) ;
            that._ymdate.year = undefined ;
            that._ymdate.month = undefined ;
        }
        var offset = (function(){
            var offset = $input.offset() ,
                size = { w: $input.outerWidth() , h: $input.outerHeight() } ;
            return {
                top: offset.top + size.h ,
                left: offset.left ,
                width: size.w ,
                height: size.h
            }
        })();
        generateHtml() ;
        function generateHtml(){
            var isExist = false ,
                $exist_ymdate_layer = $(".ymdate_layer") ;
            $exist_ymdate_layer.each( function(){
                var $this = $(this) ,
                    guid = $.trim( $this.data("guid") ) ;
                if( guid == that._ymdate.guid ){ isExist = true ; return false ; }
                else{ removeYmdate( guid ) ; }
            } ) ;
            if( isExist === true ){ return false; }

            // 生成新的时间控件
            var guid = tool.guid() ,
                ymdate_layer = '<div class="ymdate_layer" data-guid=' + guid + '><ul class="ymdate_year"></ul><ul class="ymdate_month"></ul></div>' ,
                html_year = '' ,
                now = new Date() ,
                now_year = now.getFullYear() ,
                now_month = now.getMonth() ,
                previous_year = that._ymdate.year ,
                previous_month = that._ymdate.month ,
                limit = (function(){
                    var _limit = that._ymdate.config ,
                        max = ( _limit.max || "" ).split("-") ,
                        max_year = $.trim( max[0] ) ,
                        max_month = $.trim( max[1] ) ,
                        min = ( _limit.min || "" ).split("-") ,
                        min_year = $.trim( min[0] ) ,
                        min_month = $.trim( min[1] ) ;
                    var now = new Date() ,
                        now_year = now.getFullYear() ,
                        now_month = now.getMonth() + 1 ;
                    max_year = max_year == "" ? "" : Number( max_year ) ;
                    max_month = max_month == "" ? "" : Number( max_month ) ;
                    min_year = min_year == "" ? "" : Number( min_year ) ;
                    min_month = min_month == "" ? "" : Number( min_month ) ;

                    // 如果没有设置最大值，默认最大值为当前
                    max_year = max_year == "" ? now_year : max_year ;
                    max_month = max_month == "" ? now_month : max_month ;
                    return {
                        max_year: max_year ,
                        max_month: max_month ,
                        min_year: min_year ,
                        min_month: min_month
                    }
                })() ,
                $ymdate_layer = $( ymdate_layer ) ,
                $ymdate_year = $ymdate_layer.find(".ymdate_year") ,
                $ymdate_month = $ymdate_layer.find(".ymdate_month") ;
            // 年份
            if( that._ymdate.config.uptonow === true ){                                 // 是否显示至今
                if( that._ymdate.isUptonow === true ){
                    html_year += '<li class="uptonow active"><span>至今</span></li>' ;
                }else {
                    html_year += '<li class="uptonow"><span>至今</span></li>' ;
                }
            }
            for (var i = now_year ; i >= ( now_year - 26 ) ; i-- ) {
                var className = '';
                // 是否选中
                if( previous_year == i && that._ymdate.isUptonow === false ){
                    className += "active" ;
                }
                // 是否 年份限制
                if( limit.max_year != "" ){
                    if( limit.max_year >= i ){}
                    else {
                        className += " disable" ;
                    }
                }
                if( limit.min_year != "" ){
                    if( limit.min_year <= i ){}
                    else {
                        className += " disable" ;
                    }
                }
                html_year += '<li class="' + className + '">' + i + '</li>';
            } ;
            $ymdate_year.html( html_year ) ;

            // 月份
            function generateMonth( year ){
                var html_month = '' ,
                    currentDate = null ,
                    maxDate = null ,
                    minDate = null ;
                // 是否 月份限制
                if( limit.max_year != "" ){
                    maxDate = new Date() ;
                    if( limit.max_month != "" ){
                        maxDate.setFullYear( limit.max_year , limit.max_month , 1 ) ;
                    }else{
                        maxDate.setFullYear( limit.max_year , 12 , 31 );
                    }
                }
                if( limit.min_year != "" ){
                    minDate = new Date() ;
                    if( limit.min_month != "" ){
                        minDate.setFullYear( limit.min_year , limit.min_month , 1 ) ;
                    }else{
                        minDate.setFullYear( limit.min_year , 12 , 31 );
                    }
                }
                // 月份
                if( year ){
                    for (var i = 1 ; i <= 12 ; i++) {
                        var className = '' ;
                        currentDate = new Date() ;
                        currentDate.setFullYear( year , i , 1 ) ;
                        // 是否选中
                        if( previous_month == i && previous_year == year ){
                            className += "active";
                        }
                        if( maxDate != null ){
                            if( maxDate >= currentDate ){}
                            else{
                                className += ' disable' ;
                            }
                        }
                        if( minDate != null ){
                            if( minDate <= currentDate ){}
                            else{
                                className += ' disable' ;
                            }
                        }
                        html_month += '<li class="' + className + '"><span>' + i + '月</span></li>';
                    } ;
                }else{
                    for (var i = 1 ; i <= 12 ; i++) {
                        var className = '';
                        // 是否选中
                        if( previous_month ){
                            if( previous_month == i ){ className = "active"; }
                        }
                        html_month += '<li class="' + className + '"><span>' + i + '月</span></li>';
                    } ;
                }
                $ymdate_month.html( html_month ) ;
            }

            $ymdate_layer.css({
                "position": "absolute" ,
                "left": offset.left + "px" ,
                "top": offset.top + "px"
            }).appendTo( $body ) ;
            // 存储数据
            $.data( _cache , guid , $ymdate_layer ) ;
            $.extend( that._ymdate , { guid: guid } ) ;
            // 绑定事件
            $ymdate_layer.on( "click" , ".ymdate_year li" , function( ev , type ){
                var $this = $( this ) ,
                    guid = $.trim( $this.closest(".ymdate_layer").data("guid") ) ;
                if( $this.hasClass("uptonow") ){
                    $.extend( that._ymdate , { isUptonow: true } ) ;
                    that._ymdate.year = undefined ;
                    that._ymdate.month = undefined ;
                    fillInput("uptonow") ;
                    removeYmdate( guid ) ;
                    return false ;
                }
                if( ( $this.hasClass("active") && type == undefined ) || $this.hasClass("disable") ){ return false ; }

                var year = $.trim( $this.text() ) ;
                $this.addClass("active").siblings(".active").removeClass("active") ;
                $.extend( that._ymdate , { year: year , isUptonow: false } ) ;
                generateMonth( year ) ;
                ev.stopPropagation() ;
            } ).on( "click" , ".ymdate_month li" , function( ev ){
                var $this = $( this ) ,
                    month = $.trim( $this.text() ).replace(/月/g,"") ;
                guid = $.trim( $this.closest(".ymdate_layer").data("guid") ) ;
                if( $this.hasClass("disable") || that._ymdate.isUptonow === true || ( that._ymdate.isUptonow === false && that._ymdate.year === undefined ) ){ return false ; }
                $.extend( that._ymdate , { month: tool.padNumber( month , 2 ) , isUptonow: false } ) ;
                fillInput() ;
                removeYmdate( guid ) ;
                ev.stopPropagation() ;
            } ) ;
            // 如果有年份，默认跳转到选中的位置
            if( previous_year != undefined ){
                scrollActiveYear() ;
            }else{
                // 默认选中第一个非至今，非disable类
                if( that._ymdate.isUptonow === true ){

                }else{
                    $ymdate_year.find("li").not(".disable,.uptonow").eq(0).addClass("active") ;
                    scrollActiveYear() ;
                }
            }
            // 显示区域显示选中的年份，并展示相应的月份
            function scrollActiveYear() {
                var $active_year = $ymdate_year.find(".active") ,
                    index = $active_year.index() ;
                if( $active_year.length > 0 && !$active_year.hasClass("uptonow") ){
                    var height_p = $ymdate_year.innerHeight() ,
                        height_single = $active_year.outerHeight() ,
                        scrollTop = index * height_single ;
                    if( scrollTop >= height_p ){
                        $ymdate_year.scrollTop( scrollTop - 2 * height_single ) ;
                    }
                }
                // 根据年份选择激活月份
                $active_year.trigger( "click" , "generateMonth" ) ;
            }
            // 填充日期
            function fillInput( isUptonow ){
                if( isUptonow == "uptonow" ){
                    $input.val("至今") ;
                    that._ymdate.config.onpicked( "至今" ) ;
                    return false ;
                }
                var txt = that._ymdate.year + '-' + that._ymdate.month ;
                $input.val( txt ) ;
                that._ymdate.config.onpicked( txt ) ;
            }
            // 关闭日期选择
            function removeYmdate( guid ){
                var $tmpl = $.data( _cache , guid ) ;
                if( $tmpl ){
                    $tmpl.remove() ;
                    $.removeData( _cache , guid ) ;
                }
            }
        }
    } ;

    // 绑定jquery方法
    $.extend( $.fn , {
        ymdate: function( config ){
            this.each( function(){
                ymdate.call( this , config ) ;
            } ) ;
        }
    } )
});