/*! echo-js v1.7.3 | (c) 2016 @toddmotto | https://github.com/toddmotto/echo */
//!function(t,e){"function"==typeof define&&define.amd?define(function(){return e(t)}):"object"==typeof exports?module.exports=e:t.echo=e(t)}(this,function(t){"use strict";var e,n,o,r,c,a={},u=function(){},d=function(t){return null===t.offsetParent},i=function(t,e){if(d(t))return!1;var n=t.getBoundingClientRect();return n.right>=e.l&&n.bottom>=e.t&&n.left<=e.r&&n.top<=e.b},l=function(){(r||!n)&&(clearTimeout(n),n=setTimeout(function(){a.render(),n=null},o))};return a.init=function(n){n=n||{};var d=n.offset||0,i=n.offsetVertical||d,f=n.offsetHorizontal||d,s=function(t,e){return parseInt(t||e,10)};e={t:s(n.offsetTop,i),b:s(n.offsetBottom,i),l:s(n.offsetLeft,f),r:s(n.offsetRight,f)},o=s(n.throttle,250),r=n.debounce!==!1,c=!!n.unload,u=n.callback||u,a.render(),document.addEventListener?(t.addEventListener("scroll",l,!1),t.addEventListener("load",l,!1)):(t.attachEvent("onscroll",l),t.attachEvent("onload",l))},a.render=function(){for(var n,o,r=document.querySelectorAll("img[data-echo], [data-echo-background]"),d=r.length,l={l:0-e.l,t:0-e.t,b:(t.innerHeight||document.documentElement.clientHeight)+e.b,r:(t.innerWidth||document.documentElement.clientWidth)+e.r},f=0;d>f;f++)o=r[f],i(o,l)?(c&&o.setAttribute("data-echo-placeholder",o.src),null!==o.getAttribute("data-echo-background")?o.style.backgroundImage="url("+o.getAttribute("data-echo-background")+")":o.src=o.getAttribute("data-echo"),c||(o.removeAttribute("data-echo"),o.removeAttribute("data-echo-background")),u(o,"load")):c&&(n=o.getAttribute("data-echo-placeholder"))&&(null!==o.getAttribute("data-echo-background")?o.style.backgroundImage="url("+n+")":o.src=n,o.removeAttribute("data-echo-placeholder"),u(o,"unload"));d||a.detach()},a.detach=function(){document.removeEventListener?t.removeEventListener("scroll",l):t.detachEvent("onscroll",l),clearTimeout(n)},a});

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
    		define(function() {
      		return factory(root);
    		});
	} else if (typeof exports === 'object') {
    		module.exports = factory;
	} else {
    		root.echo = factory(root);
	}
})(this, function (root) {

  'use strict';

  var echo = {};

  var callback = function () {};

  var offset, poll, delay, useDebounce, unload, isRenderAll = false, isInit = false;

  var isHidden = function (element) {
    return (element.offsetParent === null);
  };
  
  var inView = function (element, view) {
    if (isHidden(element)) {
      return false;
    }

    var box = element.getBoundingClientRect();
    return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
  };

  var debounceOrThrottle = function () {
    if(!useDebounce && !!poll) {
      return;
    }
    clearTimeout(poll);
    poll = setTimeout(function(){
      echo.render();
      poll = null;
    }, delay);
  };

  echo.init = function (opts) {
    opts = opts || {};
    var offsetAll = opts.offset || 0;
    var offsetVertical = opts.offsetVertical || offsetAll;
    var offsetHorizontal = opts.offsetHorizontal || offsetAll;
    var optionToInt = function (opt, fallback) {
      return parseInt(opt || fallback, 10);
    };
    offset = {
      t: optionToInt(opts.offsetTop, offsetVertical),
      b: optionToInt(opts.offsetBottom, offsetVertical),
      l: optionToInt(opts.offsetLeft, offsetHorizontal),
      r: optionToInt(opts.offsetRight, offsetHorizontal)
    };
    delay = optionToInt(opts.throttle, 250);
    useDebounce = opts.debounce !== false;
    unload = !!opts.unload;
    callback = opts.callback || callback;
    isRenderAll = opts.isRenderAll || false;
    echo.render();
	isInit = true;
    if (document.addEventListener) {
      root.addEventListener('scroll', debounceOrThrottle, false);
      root.addEventListener('load', debounceOrThrottle, false);
    } else {
      root.attachEvent('onscroll', debounceOrThrottle);
      root.attachEvent('onload', debounceOrThrottle);
    }
  };

  echo.render = function () {
    var nodes = document.querySelectorAll('img[data-echo], [data-echo-background]');
    var length = nodes.length;
    var src, elem;
    var view = {
      l: 0 - offset.l,
      t: 0 - offset.t,
      b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
      r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
    };
    for (var i = 0; i < length; i++) {
      elem = nodes[i];
      if (inView(elem, view) || isRenderAll) {

        if (unload) {
          elem.setAttribute('data-echo-placeholder', elem.src);
        }

        if (elem.getAttribute('data-echo-background') !== null) {
          elem.style.backgroundImage = "url(" + elem.getAttribute('data-echo-background') + ")";
        }
//      else {
//        elem.src = elem.getAttribute('data-echo');
//      }
		
        callback(elem, 'load');

        if (!unload) {
          elem.removeAttribute('data-echo');
          elem.removeAttribute('data-echo-background');
        }
      } else if (unload && !!(src = elem.getAttribute('data-echo-placeholder'))) {

        if (elem.getAttribute('data-echo-background') !== null) {
          elem.style.backgroundImage = "url(" + src + ")";
        } else {
          elem.src = src;
        }

        elem.removeAttribute('data-echo-placeholder');
        callback(elem, 'unload');
      }
    }
    
//  if (!length) {
//    echo.detach();
//  }
  };

  echo.detach = function () {
    if (document.removeEventListener) {
      root.removeEventListener('scroll', debounceOrThrottle);
    } else {
      root.detachEvent('onscroll', debounceOrThrottle);
    }
    clearTimeout(poll);
  };
  
  echo.isInit = function(){
  	return isInit;
  }

  return echo;

});

//(function(window){
//	echo.init({
//		offsetVertical : 100,
//		callback:function(elem, op){
//			var imageUrl = elem.getAttribute('data-echo');
//			api.imageCache({
//				url: imageUrl,
//				policy : 'cache_only',
//				//policy : 'cache_else_network',
//				thumbnail : false
//			},function( ret, err ){
//				elem.src = ret.url;
//			});
//		}
//	});
//	
//	api.addEventListener({
//		name: 'refresh_data_' + api.frameName
//	}, function(ret, err){
//		if(ret && ret.value.refresh == true){
////			setTimeout(function(){
//				echo.render();
////			},25);
//		}
//	});
//	
//})(window);


(function (root, factory) {
if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(root);
    });
} else if (typeof exports === 'object') {
    module.exports = factory;
} else {
    root.echoExt = factory(root);
}
})(this,function(root){
	
	var echoExt = {};
	var refresh;
	
	function animation(){
		var style = document.createElement("style");
		document.head.appendChild(style);
		var sheet = style.sheet;
//		var token = window.WebKitCSSKeyframesRule ? "-webkit-" : "";
		var token = "-webkit-";

  		sheet.insertRule("@" + token + "keyframes fadeIn { to { opacity : 1 } }",0);
  		sheet.insertRule(".opacityFadeIn {" + token + "animation: fadeIn 1s ease forwards; }",1);
  		sheet.insertRule("@" + token + "keyframes fadeOut { to { opacity : 0 } }",2);
  		sheet.insertRule(".opacityFadeOut {" + token + "animation: fadeOut 0.3s ease forwards; }",1);
	}
	
	function callback(elem, op){
		var imageUrl = elem.getAttribute('data-echo');
		api.imageCache({
			url: imageUrl,
			policy : 'cache_only',
			//policy : 'cache_else_network',
			thumbnail : false
		},function( ret, err ){
			var className = elem.className;
						
			elem.className += " opacityFadeOut";
						
			setTimeout(function(){
				elem.style.opacity = 0;
				elem.className = className + " opacityFadeIn";
				elem.src = ret.url;
//				elem.src = imageUrl;
			},300);
						
			setTimeout(function(){
				elem.style.opacity = 1;
				elem.className = className;
			},1300);
						
		});
	}
	
	echoExt.init = function(){
		if(!echo.isInit()){
			animation();
			echo.init({
				offsetVertical : api.winHeight,
				callback:callback
			});
		}
		
		api.addEventListener({
		    name: 'refresh_data_' + api.frameName
		}, function(ret, err){
//			alert(JSON.stringify(ret.value));
			
			if(ret && ret.value.refresh){
				refresh = ret.value.refresh;
				echo.render();
			}
			
//			if(refresh == 'isInit'){
////				setTimeout(function(){
//					echo.render();
////				},25);
//			}

		});
		
	};
	
	echoExt.render = function(){
		if(!echo.isInit()){
			animation();
			echo.init({
				isRenderAll : true,
				callback:callback
			});
		} else {
			echo.render();
		}
	}
	
	return echoExt;
});
