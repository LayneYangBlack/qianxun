//======================工具js


//动画滚动
function animationScroll(scrollTop,time) {
    if(scrollTop<0){
        scrollTop=0;
    }
    if(scrollTop>(getScrollHeight()-getWindowHeight())){
        scrollTop=getScrollHeight()-getWindowHeight();
    }

    var orgScollTop=  getScrollTop(),
        scrollHeight = orgScollTop-scrollTop,
        scrollStep = Math.PI / ( time / 15 ),
        cosParameter = scrollHeight / 2,
        scrollCount = 0,
        scrollMargin;

    requestAnimationFrame(step);
    function step () {
        setTimeout(function() {

            //if ( orgScollTop-getScrollTop()<scrollHeight) {
            if ( (scrollHeight>0&&orgScollTop-getScrollTop()<scrollHeight)||(scrollHeight<0&&orgScollTop-getScrollTop()>scrollHeight)) {
                    requestAnimationFrame(step);
                    scrollCount = scrollCount + 1;
                    scrollMargin = cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
                    window.scrollTo( 0, ( getScrollTop() - scrollMargin ) );
                }
        }, 15 );
    }
}
//动画滚动
function animationScroll1(scrollTop,time){
    if(scrollTop<0){
        return;
    }
    time=time||1200;
    var orgScollTop=  getScrollTop();
    var scrollHeight = orgScollTop-scrollTop;
    var stepNum=time/15;
    var scrollMargin=Math.round(scrollHeight/stepNum);

    requestAnimationFrame(function(){step(time)});
    function step (remainTime) {
        if(remainTime<0){
            window.scrollTo(0,scrollTop);
        }else{
            if(orgScollTop-getScrollTop()<=scrollHeight){
                window.scrollTo( 0, ( getScrollTop() - scrollMargin ) );
                setTimeout(function(){
                    requestAnimationFrame(function(){step(remainTime-15)});
                },15);
            }
        }
    }

}

function animationScroll2(scrollTop,time){

    //document.body.style.transition="all 1s ease";
    //document.body.style.marginTop=(scrollTop-getScrollTop())+'px';
    //document.body.style.transition="none";
    //document.body.scrollTop=scrollTop;
    //document.body.style.marginTop=0;

}

function add(a, b) {
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (mul(a, e) + mul(b, e)) / e;
}

function sub(a, b) {
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e;
}

function mul(a, b) {
    var c = 0,
        d = a.toString(),
        e = b.toString();
    try {
        c += d.split(".")[1].length;
    } catch (f) {}
    try {
        c += e.split(".")[1].length;
    } catch (f) {}
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}

function div(a, b) {
    var c, d, e = 0,
        f = 0;
    try {
        e = a.toString().split(".")[1].length;
    } catch (g) {}
    try {
        f = b.toString().split(".")[1].length;
    } catch (g) {}
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
}

function getImgWh(url,callback) {
    var img = new Image();
    img.src = url;
    if (img.complete) {
        callback(img.width, img.height);
    } else {
        img.onload = function () {
            callback(img.width, img.height);
            img.onload = null;
        };
        //test去连的时候 读不到文件
        img.onerror =function(){
            callback(200,400);
            img.onerror = null;
        }
    };
};

//检查手机号码
function checkMobileNum(mobileNum){
    if(!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(mobileNum))){
        return false; 
    }
    return true;
}


function  IDcard(num){
    if (!(/\d{15}|\d{17}[0-9Xx]/.test(num))) {
        return false;
    }
    return true;
}


function getScrollTop(){
    var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
    if(document.body){
        bodyScrollTop = document.body.scrollTop;
    }
    if(document.documentElement){
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}

//文档的总高度
function getScrollHeight(){
    var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
    if(document.body){
        bodyScrollHeight = document.body.scrollHeight;
    }
    if(document.documentElement){
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
}

//浏览器视口的高度
function getWindowHeight(){
    var windowHeight = 0;
    if(document.compatMode == "CSS1Compat"){
        windowHeight = document.documentElement.clientHeight;
    }else{
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}

function util_randomSort(oArr) {
    if(oArr.length==0){
        return oArr;
    }
    var temp_x; //临时交换数
    var tArr = oArr.slice(0);//新数组,复制原数组
    var random_x;
    for(var i=oArr.length;i>0;i--) {
        random_x = Math.floor(Math.random()*i); //   取得一个随机数
        temp_x = tArr[random_x];
        tArr[random_x] = tArr[i-1];
        tArr[i-1] = temp_x;
    }
    return tArr; //返回新数组
}


function doNothing() {
}

//检查是否是数字
function isNum(num){
    if(!(/^\d*$/.test(num))){
        return false; 
    }
    return true;
} 


function isBlack(data) {
    return (data == "" || typeof(data)  == "undefined" || data == null || isNullJson(data)) ? true : false;
}

function isNotBlack(data) {
    return (data == "" || typeof(data)  == "undefined"|| data == null || isNullJson(data)) ? false : true;
}

function isFunction(func) {
    if (typeof(func) == "function") {
    		return true;
    }
    return false;
}


function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

function isObject(obj) {
 	return obj instanceof Object;
}

function isNullJson(obj) {
    return isJson(obj) && JSON.stringify(obj) == '{}';
}
function isJson(obj) {
    return typeof(obj) == "object" &&
        Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
}
var deepCopy= function(source) {
    var result={};
    for (var key in source) {
        result[key] = typeof source[key]==='object'? deepCopy(source[key]): source[key];
    }
    return result;
}

String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}

String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
    return true;
}
String.prototype.endWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
    return true;
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}


Array.prototype.remove = function(obj) {
    for(var i=0;i<this.length;i++){
        if (this[i] == obj) {
            this.splice(i, 1);
        }
    }
}

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

//使用方法
//var now = new Date();
//var nowStr = now.format("yyyy-MM-dd hh:mm:ss");

function parseDate(str) {
    if (typeof str == 'string') {
        var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);
        if (results && results.length > 3) {
            return new Date(parseInt(results[1], 10), (parseInt(results[2], 10) - 1), parseInt(results[3], 10));
        }
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);
        if (results && results.length > 6)
            return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10), parseInt(results[6], 10));
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,9}) *$/);
        if (results && results.length > 7)
            return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10), parseInt(results[6], 10), parseInt(results[7], 10));
    }
    return null;
}



/**
 * 阻止事件冒泡
 * @param event
 */
function stopEventBubble(event) {
    var e = event || window.event;

    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    else {
        if(e) {
            e.cancelBubble = true;
        }
    }
}

//获取文件后缀名字 (返回.jpg)
function getFileSuffix(file_name){
    var result =/\.[^\.]+/.exec(file_name);
    return result;
}

//获取随机数字
//var num = GetRandomNum(1,10);
function getRandomNum(Min,Max)
{
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}


function formatDate(time) {
    var day = new Date(time);
    var Year = 0;
    var Month = 0;
    var Day = 0;
    var CurrentDate = "";
    //初始化时间
    //Year= day.getYear();//有火狐下2008年显示108的bug
    Year = day.getFullYear(); //ie火狐下都可以
    Month = day.getMonth() + 1;
    Day = day.getDate();
    //Hour = day.getHours();
    // Minute = day.getMinutes();
    // Second = day.getSeconds();
    CurrentDate += Year + "";
    if (Month >= 10) {
        CurrentDate += Month + "";
    } else {
        CurrentDate += "0" + Month + "";
    }
    if (Day >= 10) {
        CurrentDate += Day;
    } else {
        CurrentDate += "0" + Day;
    }
    return CurrentDate;
}


//格式化现在得日期
function getNowFormatDate() {
    var day = new Date();
    var Year = 0;
    var Month = 0;
    var Day = 0;
    var CurrentDate = "";
    //初始化时间
    //Year= day.getYear();//有火狐下2008年显示108的bug
    Year = day.getFullYear(); //ie火狐下都可以
    Month = day.getMonth() + 1;
    Day = day.getDate();
    //Hour = day.getHours();
    // Minute = day.getMinutes();
    // Second = day.getSeconds();
    CurrentDate += Year + "";
    if (Month >= 10) {
        CurrentDate += Month + "";
    } else {
        CurrentDate += "0" + Month + "";
    }
    if (Day >= 10) {
        CurrentDate += Day;
    } else {
        CurrentDate += "0" + Day;
    }
    return CurrentDate;
}

//得到聊天的时间
function getChatTime(begin, end , Interface) {
    var weekday = new Array(7);
    weekday[0] = "星期天";
    weekday[1] = "星期一";
    weekday[2] = "星期二";
    weekday[3] = "星期三";
    weekday[4] = "星期四";
    weekday[5] = "星期五";
    weekday[6] = "星期六";
    var time;
    var time2;
    if (begin.getYear() == end.getYear()) {//如果年相等继续
        if (begin.getMonth() == end.getMonth()) {//如果月相等继续
            if (begin.getDate() == end.getDate()) {//是不是今天
                time = hour(begin) + minute(begin);
                time2 = hour(begin) + minute(begin);
                //是就显示时分
            } else {//不是就判断是不是昨天
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                end.setMilliseconds(0);
                var Differ = end - begin;
                if (parseInt(Differ / 3600000) <= 24) {
                    time = '昨天';
                    time2 = '昨天  ' + hour(begin) + minute(begin);
                } else {//不是昨天一周之内就显示星期几不然就具体时间
                    if (parseInt(Differ / 3600000) <= 144) {
                        time = day(weekday, begin);
                        time2 =day(weekday, begin)+ ' ' + hour(begin) + minute(begin);
                    } else {
                        time =  month(begin) + date(begin);
                        time2 =  month(begin) + date(begin)+ ' ' + hour(begin) + minute(begin);
                    }
                }
            }
        } else {//月不等，直接显示
            time = month(begin) + date(begin);
            time2 = month(begin) + date(begin)+ ' ' + hour(begin) + minute(begin);
        }
    } else {//年不等，直接显示
        time = year(begin) + month(begin) + date(begin);
        time2 = year(begin) + month(begin) + date(begin);
    }
    if(Interface==0){
        return time;
    }else{
        return time2;
    }

}

function year(date) {
    return date.getFullYear() + '-';
}

function month(date) {
    var tt = date.getMonth() + 1;
    if (tt < 10) {
        tt = '0' + tt;
    }
    return tt + '-';
}

function date(date) {
    var tt = date.getDate();
    if (tt < 10) {
        tt = '0' + tt;
    }
    return tt + ' ';
}

function hour(date) {
    var tt = date.getHours();
    if (tt < 10) {
        tt = '0' + tt;
    }
    return tt + ':';
}

function minute(date) {
    var tt = date.getMinutes();
    if (tt < 10) {
        tt = '0' + tt;
    }
    return tt;
}

function day(weekday, date) {
    return weekday[date.getDay()];
}


function indexOf(arr, str) {
    // 如果可以的话，调用原生方法
    if (arr && arr.indexOf) {
        return arr.indexOf(str);
    }
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        // 定位该元素位置
        if (arr[i] == str) {
            return i;
        }
    }
    // 数组中不存在该元素
    return -1;
}

function base64_encode(str) {
    var c1, c2, c3;
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var i = 0, len = str.length, string = '';

    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            string += base64EncodeChars.charAt(c1 >> 2);
            string += base64EncodeChars.charAt((c1 & 0x3) << 4);
            string += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            string += base64EncodeChars.charAt(c1 >> 2);
            string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            string += base64EncodeChars.charAt((c2 & 0xF) << 2);
            string += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        string += base64EncodeChars.charAt(c1 >> 2);
        string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        string += base64EncodeChars.charAt(c3 & 0x3F)
    }
    return string
}

function base64_decode(str) {
    var c1, c2, c3, c4;
    var base64DecodeChars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57,
        58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6,
        7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
        37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1,
        -1, -1
    );
    var i = 0, len = str.length, string = '';

    while (i < len) {
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (
        i < len && c1 == -1
            );

        if (c1 == -1) break;

        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (
        i < len && c2 == -1
            );

        if (c2 == -1) break;

        string += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61)
                return string;

            c3 = base64DecodeChars[c3]
        } while (
        i < len && c3 == -1
            );

        if (c3 == -1) break;

        string += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61) return string;
            c4 = base64DecodeChars[c4]
        } while (
        i < len && c4 == -1
            );

        if (c4 == -1) break;

        string += String.fromCharCode(((c3 & 0x03) << 6) | c4)
    }
    return string;
}




var rotateLeft = function(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
}

var addUnsigned = function(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else {
        return (lResult ^ lX8 ^ lY8);
    }
}

var F = function(x, y, z) {
    return (x & y) | ((~ x) & z);
}

var G = function(x, y, z) {
    return (x & z) | (y & (~ z));
}

var H = function(x, y, z) {
    return (x ^ y ^ z);
}

var I = function(x, y, z) {
    return (y ^ (x | (~ z)));
}

var FF = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var GG = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var HH = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var II = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var convertToWordArray = function(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWordsTempOne = lMessageLength + 8;
    var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
};

var wordToHex = function(lValue) {
    var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValueTemp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
};

var uTF8Encode = function(string) {
    string = string.replace(/\x0d\x0a/g, "\x0a");
    var output = "";
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            output += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            output += String.fromCharCode((c >> 6) | 192);
            output += String.fromCharCode((c & 63) | 128);
        } else {
            output += String.fromCharCode((c >> 12) | 224);
            output += String.fromCharCode(((c >> 6) & 63) | 128);
            output += String.fromCharCode((c & 63) | 128);
        }
    }
    return output;
};

function hex_md5(string) {
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
    string = uTF8Encode(string);
    x = convertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
        b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
        b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
        a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
        d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
        c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
        c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
        a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
        d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
        c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
        a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
        a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
        b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
        d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return tempValue.toLowerCase();
}



Array.prototype.getList = function()
{
    this.sort();
    var re=[this[0]];
    for(var i = 1; i < this.length; i++)
    {
        if( this[i] !== re[re.length-1])
        {
            re.push(this[i]);
        }
    }
    return re;
};

var format = function(time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
}

var formatTimeToDate = function(time){
    return new Date(time).format("yyyy-MM-dd hh:mm");
};

var formatTimeToAll = function(time){
    return new Date(time).format("yyyy-MM-dd hh:mm:ss");
};
var formatTimeToDay = function(time){
    return new Date(time).format("yyyy-MM-dd");
};

Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};