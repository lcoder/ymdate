## 仿拉勾时间段选择控件

基于jquery的时间段选择控件：

![基于jquery的时间段日期控件](http://oco9w3mgp.bkt.clouddn.com/blog_images/ymdate_demo.png)

使用方法:

```javascript
$("#ymdate").ymdate( {
        uptonow: true ,					// 是否现实“至今”时间段
        onpicked: function( value ){	// 选中时间段之后的回调
            console.log( value );
            console.log( $("#ymdate")[0]._ymdate ) ;	// ymdate对象绑定在element上
            $("#ymdate")[0]._ymdate.config.max = '2015-02' ;	// 设置可选的最大值
            $("#ymdate")[0]._ymdate.config.min = '2014-02' ;	// 设置好可选的最小值		
        }
    } ) ;
```

