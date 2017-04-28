/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
!function(){function a(a){return a.replace(t,"").replace(u,",").replace(v,"").replace(w,"").replace(x,"").split(y)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(c,d){function e(a){return m+=a.split(/\n/).length-1,k&&(a=a.replace(/\s+/g," ").replace(/<!--[\w\W]*?-->/g,"")),a&&(a=s[1]+b(a)+s[2]+"\n"),a}function f(b){var c=m;if(j?b=j(b,d):g&&(b=b.replace(/\n/g,function(){return m++,"$line="+m+";"})),0===b.indexOf("=")){var e=l&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),e){var f=b.replace(/\s*\([^\)]+\)/,"");n[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=s[1]+b+s[2]}return g&&(b="$line="+c+";"+b),r(a(b),function(a){if(a&&!p[a]){var b;b="print"===a?u:"include"===a?v:n[a]?"$utils."+a:o[a]?"$helpers."+a:"$data."+a,w+=a+"="+b+",",p[a]=!0}}),b+"\n"}var g=d.debug,h=d.openTag,i=d.closeTag,j=d.parser,k=d.compress,l=d.escape,m=1,p={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},q="".trim,s=q?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],t=q?"$out+=text;return $out;":"$out.push(text);",u="function(){var text=''.concat.apply('',arguments);"+t+"}",v="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+t+"}",w="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(g?"$line=0,":""),x=s[0],y="return new String("+s[3]+");";r(c.split(h),function(a){a=a.split(i);var b=a[0],c=a[1];1===a.length?x+=e(b):(x+=f(b),c&&(x+=e(c)))});var z=w+x+y;g&&(z="try{"+z+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(c)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var A=new Function("$data","$filename",z);return A.prototype=n,A}catch(B){throw B.temp="function anonymous($data,$filename) {"+z+"}",B}}var d=function(a,b){return"string"==typeof b?q(b,{filename:a}):g(a,b)};d.version="3.0.0",d.config=function(a,b){e[a]=b};var e=d.defaults={openTag:"<%",closeTag:"%>",escape:!0,cache:!0,compress:!1,parser:null},f=d.cache={};d.render=function(a,b){return q(a,b)};var g=d.renderFile=function(a,b){var c=d.get(a)||p({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};d.get=function(a){var b;if(f[a])b=f[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=q(d,{filename:a})}}return b};var h=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?h(a.call(a)):""),a},i={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},j=function(a){return i[a]},k=function(a){return h(a).replace(/&(?![\w#]+;)|[<>"']/g,j)},l=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},m=function(a,b){var c,d;if(l(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},n=d.utils={$helpers:{},$include:g,$string:h,$escape:k,$each:m};d.helper=function(a,b){o[a]=b};var o=d.helpers=n.$helpers;d.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var p=function(a){return d.onerror(a),function(){return"{Template Error}"}},q=d.compile=function(a,b){function d(c){try{return new i(c,h)+""}catch(d){return b.debug?p(d)():(b.debug=!0,q(a,b)(c))}}b=b||{};for(var g in e)void 0===b[g]&&(b[g]=e[g]);var h=b.filename;try{var i=c(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",p(j)}return d.prototype=i.prototype,d.toString=function(){return i.toString()},h&&b.cache&&(f[h]=d),d},r=n.$each,s="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",t=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,u=/[^\w$]+/g,v=new RegExp(["\\b"+s.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),w=/^\d[^,]*|,\d[^,]*/g,x=/^,+|,+$/g,y=/^$|,+/;"function"==typeof define?define(function(){return d}):"undefined"!=typeof exports?module.exports=d:this.template=d}();

template.config("escape", false);
template.helper('encode',function(value){
    if(value){
        return html_encode(value);
    }else{
        return '';
    }
});
template.helper('decode',function(value){
    if(value){
        return html_decode(value);
    }else{
        return '';
    }
});

function html_encode(str) {
    if(str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&/g, "&gt;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br>");
        return s;
    }else{
        return str;
    }

}

function html_decode(str)
{
    if(str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&gt;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/<br>/g, "\n");
        return s;
    }else{
        return str;
    }
}

template.helper('encodeJson',function(value){
    if(value){
        if(isJson(value)) {
            return html_encode(JSON.stringify(value));
        }else{
            return html_encode(value);
        }
    }else{
        return '';
    }
});

template.helper('getW', function (c,m) {
    m=m||0;
    return Math.round((api.frameWidth-m)*c);
});

//如果是/html返回加上路径。如果是http开头的是http之类的 直接打开。
template.helper('getAdPath', function (c,m) {
    if(c.startWith("/html")){
        if(m==2){
            c='../..'+c;
        }
        if(m==1){
            c='..'+c;
        }
        if(m==0){
            c='.'+c;
        }
    }
    return c;
});

template.helper('getDateTime', function (l,formatStr) {
	if(!formatStr){
		formatStr = 'yyyy-MM-dd hh:mm:ss';
	}
	return new Date(l).format(formatStr);
});

/**
 * 将图片切割成正方形
 * 返回IMG样式
 */
template.helper('getImageBoxStyle', function (c,m,src,i) {
	var l = Math.round((api.frameWidth-m)*c);
	var imgSize = getWidthAndHeightByImageSrc(src);
	
	if(imgSize.err){
		return 'width:' + l + 'px;height:' + l +'px;margin-left:' + (m * i) + 'px;';
	}
	
	var w = 0;
	var h = 0;
	var srcW = imgSize.srcW;
	var srcH = imgSize.srcH;
	var widthAndHeight;
	
	var x1 = 0;
	var x2 = l;
	var x3 = 0;
	var x4 = l;
	
	if(srcW >= srcH){
		imgSize = getWidthAndHeightByImageSrc(src,0,l);
		w = imgSize.w;
		h = imgSize.h;
		widthAndHeight = "height:" + h + "px;";
		if(w > l) {
			x1 = (w - l) / 2;
			x2 = l + x1;
		}
//		widthAndHeight += 'margin-left:' + ((i * (l + m)) - x1) + 'px;';
//		widthAndHeight += 'margin-left:' + (l + m - x1) + 'px;';
		
		if(srcW == srcH){
			if(i > 0){
				widthAndHeight += 'margin-left:' + (m * i) + 'px;';
			}
		} else {
			if(i == 0){
				widthAndHeight += 'margin-left:' + (0 - x1) + 'px;';
			} else {
				widthAndHeight += 'margin-left:' + (0 - x1 + (m * i)) + 'px;';
			}
		}
		
		
	} else {
		imgSize = getWidthAndHeightByImageSrc(src,l);
		w = imgSize.w;
		h = imgSize.h;
		widthAndHeight = "width:" + w + "px;";
		if(h > l){
			x3 = (h - l) / 2;
			x4 = l + x3;
		}
		widthAndHeight += 'margin-top:-' + x3 + 'px;';
		if(i > 0){
			widthAndHeight += 'margin-left:' + (m * i) + 'px;';
		}
//		widthAndHeight += 'margin-left:' + (i * (l + m)) + 'px;';
	}
	
	return widthAndHeight + "position:absolute;clip: rect(" + x3 + "px " + x2 + "px "+ x4 + "px "+ x1 + "px);";
});

