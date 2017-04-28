var datalist;
var upLoadingImgSrc = '../../image/loading_more.gif';


var datalistModel = function (drawingData, url, getData, downNum, upNum, threshold,openUpAction,overload) {
    this.orgGetData=deepCopy(getData);
    this.user = getUserInfo();
    this.drawingData = drawingData;
    this.url = url;
    this.getData = getData;
    this.getData.token = this.user.token;
    this.downNum = downNum || 10;
    this.upNum = upNum || 5;
    this.currentNum = 0;//当前页面上拉加载的游标
    this.preloadNumSize = 40;//预加载个数
    this.isGetDataByUp = false;
    this.isGetDataByDown = false;
    this.isGetDataByPerload = false;
    this.hasWaitingGetUp = false;//如果上拉加载和异步预加载冲突，上拉加载会开启等待效果，等到异步加载的结果
    this.hasNoMoreData = false;
    this.cacheKey = createCacheKey(url, this.orgGetData);
    this.cursorOnDbError = 0;//db错误的时候的游标
    this.isInit=false;
    this.threshold=threshold||100;

    this.openUpAction=openUpAction||false;

    datalist = this;
    for (var m in overload) {
        if (this[m]) {
            this[m] = overload[m];
        }
    }

    this.init();
};

datalistModel.prototype = {
    init: function () {
        api.setRefreshHeaderInfo({
            visible: true,
            bgColor: 'rgba(0,0,0,0)',
            textColor: '#666',
            textDown: '下拉刷新...',
            textUp: '松开刷新...'
        }, function (ret, err) {
            if(datalist.isInit){
                datalist.refresh();
            }else{
                datalist.isInit = true;
                datalist.getDataByDown(function (result,serverResult) {
                    datalist.drawingData(result, false,serverResult);
                    datalist.afterRefresh(result);
                    api.sendEvent({
					    name: 'refresh_data_' + api.frameName,
					    extra: {
					        refresh : 'isInit'
					    }
					});
                }, function (result) {
                    datalist.drawingData(result, false);
                });
            }
        });

        api.addEventListener({
            name: 'scrolltobottom',
            extra: {
                threshold: datalist.threshold   //设置距离底部多少就触发
            }
        }, function (ret, err) {
            datalist.loadMore();
        });

        this.initData();
    },
    initData: function () {
        this.beforeInitData();
        api.refreshHeaderLoading();
    },
    beforeInitData: function () {

    },
    refresh: function () {
        this.beforeRefresh();
        var loadMoreDiv = document.getElementById("loadMoreDiv");
        if (loadMoreDiv) {
            document.body.removeChild(loadMoreDiv);
        }
        
        this.getDataByDown(function (result,serverResult) {
            datalist.drawingData(result, false,serverResult);
            datalist.afterRefresh(result);
//          setTimeout(function(){
            		api.sendEvent({
				    name: 'refresh_data_' + api.frameName,
				    extra: {
				        refresh : 'refresh_done'
				    }
				});
//          },1000);
        });
    },
    beforeRefresh: function () {

    },
    afterRefresh : function (result) {
    		
    },
    loadMore: function () {
        this.beforeLoadMore();
        this.getDataByUp(function (result) {
            datalist.drawingData(result, true)
        });
    },
    beforeLoadMore: function () {

    },
    getDataByDown: function (callBackOnGetDatas, callBackOnGetCacheDatas) {
        var startTime=new Date().getTime();
        //判断当前是否正在下拉刷新
        if (this.isGetDataByDown) {
            return;
        }
        this.isGetDataByDown = true;

        //如果有上拉，下拉也不生效（防止上拉后重置数据库，之前的下拉请求返回的数据扰乱本地数据库）
        if (this.isGetDataByUp) {
            this.downEnd();
            return;
        }
        var getData = deepCopy(this.getData);
        getData.token = this.user.token;
        getData.cursor = "0";
        getData.size =this.preloadNumSize; //默认加载2倍
        //从缓存拉取数据

        if (callBackOnGetCacheDatas) {
            var cacheDataResult = [];
            getItem(this.cacheKey, function (ret, err) {
                if (ret.status) {

                    var storageStr = "{}";
                    if (isNotBlack(ret.data)) {
                        storageStr = ret.data;
                    }

                    var value = JSON.parse(storageStr);
                    if (value.data) {
                        var j = 0;
                        var k = j + datalist.downNum;
                        //加载数据
                        for (; j < k && j < value.data.length; j++) {
                            cacheDataResult.push(value.data[j]);
                        }
                        datalist.checkHasAd(cacheDataResult,value.data,j);
                        datalist.currentNum = cacheDataResult.length;
                        callBackOnGetCacheDatas(cacheDataResult);
                    }
                }
            });
        }

        //去服务器拉取数据
        this.getPagerDataFormServer(getData, true, true, function (ret, err) {
            datalist.hasNoMoreData = false;
            if (ret.status) {
                var serverResult = ret.data;
                //alert(JSON.stringify(ret.data));
                //如果写入数据库成功展示一半的数据
                if (ret.cached) {
                    var dataResult = [];
                    for (var n = 0; n < datalist.downNum && n < serverResult.data.length; n++) {
                        dataResult.push(serverResult.data[n]);
                    }

                    //判断是否有广告。有广告多加一条。（连续广告不考虑了）
                    datalist.checkHasAd(dataResult,serverResult.data,n);

					datalist.currentNum = dataResult.length;
                    callBackOnGetDatas(dataResult,serverResult);

                    if (!serverResult.hasnext && serverResult.data.length <= datalist.downNum) {
                        datalist.hasNoMoreData = true;
                    }
                } else {
                    //写入数据库失败，在页面上一次展示多一倍的数据
                    callBackOnGetDatas(serverResult.data,serverResult);
                    datalist.cursorOnDbError = serverResult.nextCursor;
                    if (!serverResult.hasnext) {
                        datalist.hasNoMoreData = true;
                    }
                }
            }
            datalist.downEnd();
        });
    },
    getDataByUp: function (callBackOnGetDatas) {
        //检查当前是否正在上拉或者下拉.
        if (this.isGetDataByDown || this.isGetDataByUp) {
            return;
        }
        this.isGetDataByUp = true;
        //如果已经没有数据了 直接返回
        if (this.hasNoMoreData) {
            this.isGetDataByUp = false;
            return;
        }
        var dataResult = [];
        var getData = deepCopy(this.getData);

        //开始上拉效果
        this.startUpEffect();
        setTimeout(function(){
            //如果数据库存入失败,pageCursor有值
            if (datalist.cursorOnDbError > 0) {
                getData.cursor = datalist.cursorOnDbError;
                getData.size = datalist.upNum;
                this.getPagerDataFormServer(getData,false, true, function (ret, err) {
                    if (ret.status) {
                        var serverResult = ret.data;
                        callBackOnGetDatas(serverResult.data);
                        datalist.cursorOnDbError = serverResult.nextCursor;
                    }
                    datalist.upEnd();
                });
                return;
            }

            //从缓存中加载数据
            getItem(datalist.cacheKey, function (ret, err) {
                if (!ret.status || isBlack(ret.data)) {
                    datalist.upEnd();
                    return;
                }
                var value = JSON.parse(ret.data);
                //获取当前上拉数据在缓存当中得位置
                //游标数据的开始位置
                var j = datalist.currentNum;
                var k = datalist.currentNum + datalist.upNum;
                //加载数据
                for (; j < k && j < value.data.length; j++) {
                    dataResult.push(value.data[j]);
                }
                //判断是否有广告。有广告多加一条。（连续广告不考虑了）

                datalist.checkHasAd(dataResult,value.data,j);

                //没有数据
                if (dataResult.length == 0) {

                    //如果当前正在异步加载，那么上拉加载的效果不停，不调用end方法，由异步加载后的程序来调用。
                    if (datalist.isGetDataByPerload) {
                        datalist.hasWaitingGetUp = true;
                        return;
                    }
                    //设置游标为当前游标。开始异步拉取数据
                    getData.cursor = value.nextCursor;
                    getData.size = datalist.upNum * 2;
                    datalist.getPagerDataFormServer(getData, true, true, function (ret, err) {
                        if (ret.status) {
                            var serverResult = ret.data;
                            //如果写入数据库成功展示一半的数据
                            if (ret.cached) {
                                var dataResult = [];
                                for (var n = 0; n < datalist.upNum && n < serverResult.data.length; n++) {
                                    dataResult.push(serverResult.data[n]);
                                }

                                //判断是否有广告。有广告多加一条。（连续广告不考虑了）
                                datalist.checkHasAd(dataResult,serverResult.data,n);




                                //alert("write from server");
                                datalist.currentNum = datalist.currentNum + dataResult.length;
                                callBackOnGetDatas(dataResult);

                                if (serverResult.hasnext == false && serverResult.data.length <= datalist.upNum) {
                                    datalist.hasNoMoreData = true;
                                }
                            } else {
                                //写入数据库失败，在页面上一次展示多一倍的数据
                                //alert("write from server on db error");
                                callBackOnGetDatas(serverResult.data);
                                if (serverResult.hasnext == false) {
                                    datalist.hasNoMoreData = true;
                                }
                                datalist.cursorOnDbError = serverResult.nextCursor;
                            }
                        }
                        datalist.upEnd();
                    });

                } else {
                    //alert("write from db");
                    //有数据
                    datalist.currentNum = datalist.currentNum + dataResult.length;
                    callBackOnGetDatas(dataResult);
                    if (!value.hasnext) {
                        if(dataResult.length < datalist.upNum){
                            datalist.hasNoMoreData = true;
                        }
                        if(dataResult.length == datalist.upNum&&j>=value.data.length){
                            datalist.hasNoMoreData = true;
                        }
                    }
                    datalist.upEnd();

                    if (value.hasnext == false) {
                        return;
                    }
                    //alert(value.data.length);
                    //alert(j);
                    //异步加载
                    if (value.data.length - j <= datalist.upNum&&!datalist.isGetDataByPerload) {
                        datalist.isGetDataByPerload = true;
                        getData.cursor = value.nextCursor;
                        getData.size = datalist.preloadNumSize;

                        //alert("preload from server");
                        datalist.getPagerDataFormServer(getData, true, false, function (ret, err) {
                            if (ret.status) {
                                var serverResult = ret.data;
                                //如果写入数据库成功展示一半的数据
                                if (ret.cached) {
                                    var dataResult = [];
                                    for (var n = 0; n < datalist.upNum && n < serverResult.data.length; n++) {
                                        dataResult.push(serverResult.data[n]);
                                    }
                                    //判断是否有广告。有广告多加一条。（连续广告不考虑了）
                                    datalist.checkHasAd(dataResult,serverResult.data,n);


                                    if (datalist.hasWaitingGetUp) {
                                        //alert("write from server preload");
                                        datalist.currentNum = datalist.currentNum + dataResult.length;
                                        callBackOnGetDatas(dataResult);
                                        if (!serverResult.hasnext && serverResult.data.length <= datalist.upNum) {
                                            datalist.hasNoMoreData = true;
                                        }
                                    }
                                } else {
                                    //写入数据库失败，在页面上一次展示多一倍的数据
                                    if (datalist.hasWaitingGetUp) {
                                        //alert("write from server preload on db error");
                                        callBackOnGetDatas(serverResult.data);
                                    }
                                    if (serverResult.hasnext == false) {
                                        datalist.hasNoMoreData = true;
                                    }
                                    datalist.cursorOnDbError = serverResult.nextCursor;
                                }
                            } else {
                                if (datalist.hasWaitingGetUp) {
                                    api.toast({msg: "获取信息失败"});
                                }
                            }

                            if (datalist.hasWaitingGetUp) {
                                datalist.upEnd();
                            }
                            datalist.isGetDataByPerload = false;
                            datalist.hasWaitingGetUp = false;
                        });

                    }

                }
            });
        },0);


    },
    downEnd: function (nomoreData) {
        this.endUpEffect();
        api.refreshHeaderLoadDone();
        this.isGetDataByDown = false;
        this.afterDownEnd();
    },
    afterDownEnd: function () {

    },
    upEnd: function (nomoreData) {
        this.endUpEffect();
        this.isGetDataByUp = false;
    },
    startUpEffect: function () {
        var loadMoreDiv = document.getElementById("loadMoreDiv");
        if (loadMoreDiv) {
        }else{
            if(this.openUpAction){
                var div = document.createElement("div");
                div.setAttribute("id", "loadMoreDiv");
                div.innerHTML = '<img  src="' + upLoadingImgSrc + '"/> 全力加载中...';
                document.body.appendChild(div);
            }
        }
    },
    endUpEffect: function () {
        var loadMoreDiv = document.getElementById("loadMoreDiv");
        if (loadMoreDiv) {
            if (this.hasNoMoreData) {
                setTimeout(function(){
                    loadMoreDiv.innerHTML='已显示全部信息';
                },200);
            }
        }else{
            if (this.hasNoMoreData && this.openUpAction) {
//              setTimeout(function(){
                    var div = document.createElement("div");
                    div.setAttribute("id", "loadMoreDiv");
                    div.innerHTML = '已显示全部信息';
                    document.body.appendChild(div);
//              },200);
            }
        }
    },
    checkHasAd:function(resultList,allList,nowIndex){
        //判断是否有广告。有广告多加一条。（连续广告不考虑了）
        if(resultList.length>0){
            var hasAd=false;
            for(var nn=0;nn<resultList.length;nn++){
                if(resultList[nn].infoType=="ad"){
                    hasAd=true;
                }
            }
            if(hasAd&&(nowIndex< allList.length)){
                resultList.push(allList[nowIndex]);
            }
        }
    },
    getPagerDataFormServer: function (getData, saveToDb, alertServerFail, callback) {
        api.ajax({
            url: datalist.url,
            method: 'post',
            timeout: 120,
            dataType: 'json',
            returnAll: false,
            headers: {
	        		"Accept-Encoding": "gzip",
	        		"version" : version,
	        		"type" : simpleVersion ? 0 : 1
	        	},
            data: {
                values: addSignature(getData)
            }
        }, function (ret, err) {
            //读取数据失败。。
            if (!ret) {
                if (alertServerFail) {
                    api.toast({msg: "获取信息失败"});
                }
                callback({status: false, cached: false}, err);
                return;
            }

            var serverResult = ret;
            if (isBlack(serverResult.data)) {
                serverResult.data = [];
            }


            //不保存到数据库，直接返回
            if (!saveToDb) {
                callback({status: true, cached: false, data: serverResult}, err);
                return;
            }

            getItem(datalist.cacheKey, function (ret, err) {
                if (!ret.status) {
                    callback({status: true, cached: false, data: serverResult}, err);
                    return;
                }

                var storageStr = "{}";
                if (isNotBlack(ret.data)) {
                    storageStr = ret.data;
                }
                var value = JSON.parse(storageStr);
                if (value.data && isNotBlack(getData.cursor) && getData.cursor != "0") {
                    for (var n = 0; n < serverResult.data.length; n++) {
                        value.data.push(serverResult.data[n]);
                    }
                } else {
                    value.data = serverResult.data;
                }
                value.hasnext = serverResult.hasnext;
                value.nextCursor = serverResult.nextCursor;
                //写入缓存
                setItem(datalist.cacheKey, JSON.stringify(value), function (ret, err) {
                    if (ret.status) {
                        callback({status: true, cached: true, data: serverResult}, err);
                    } else {
                        callback({status: true, cached: false, data: serverResult}, err);
                    }
                });

            });
        });
    }
}


function createCacheKey(url, getData) {
    var cacheKey = url;
    for (var key in getData) {
        if (key != "cursor" && key != "size") {
            cacheKey = cacheKey + key + getData[key];
        }
    }
    return hex_md5(cacheKey);
}

function createGetUrl(url, getData) {
    var getUrl = url + "?";
    for (var key in getData) {
        getUrl = getUrl + key + "=" + getData[key] + "&";
        //getUrl = getUrl + key + "=" + encodeURIComponent(getData[key])+"&";
    }
    return getUrl;
}

function addSignature(data){
    var nowTime=new Date().getTime();
    data.t = nowTime;
    var md5Str = $api.getStorage('MD5_SECURITY_KEY');
    var needSort=[];
    for (var key in data) {
        needSort.push(key);
    }
    needSort.sort();
    for(var i=0;i<needSort.length;i++){
        if(needSort[i]!='s'&&needSort[i]!='cursor'&&(isNotBlack(data[needSort[i]])||data[needSort[i]]==0)) {
            md5Str = md5Str + hasEmoji(data[needSort[i]]);
        }
    }
//    alert(JSON.stringify(needSort)+"___,md5str:"+md5Str+",json"+JSON.stringify(data));
    data.s=hex_md5(md5Str);

    return data;
}


function hasEmoji(str) {
	str += "";
	var patt=/[\ud800-\udbff][\udc00-\udfff]/g; 
	str = str.replace(patt,function(char){
		if (char.length===2) { 
			return "*";
		} else { 
			return char; 
		} 
	});
	return str; 
}


function getServerInfoUseCache(callBackOnNullData, callBackOnCacheData,
                               callBackOnNewServerData, callBackOnServerDataError,
                               url, getData,notAlertError,notHideProcess) {
    var cacheKey = createCacheKey(url, getData);
    getItem(cacheKey, function (ret, err) {
        var storageStr = "{}";
        if (isNotBlack(ret.data)) {
            storageStr = ret.data;
        }
        var value = JSON.parse(storageStr);
        if (isBlack(value)) {
            callBackOnNullData();
        } else {
            callBackOnCacheData(value);
        }
        if (isBlack(getData)) {
            getData = {};
        }
        var user = getUserInfo();
        getData.token = user.token;
        api.ajax({
            url: url,
            method: 'post',
            timeout: 60,
            dataType: 'json',
            returnAll: false,
            headers: {
	        		"Accept-Encoding": "gzip",
	        		"version" : version,
	        		"type" : simpleVersion ? 0 : 1
	        	},
            data: {
                values: addSignature(getData)
            }
        }, function (ret, err) {
            if (ret) {
                var data = ret;
                if(data.success==false){
                    var errorMessage=data.errorMessage||'获取信息失败';
                    if(true!=notAlertError){
                        api.toast({
                            msg: errorMessage
                        });
                    }
                    callBackOnServerDataError();
                } else if (JSON.stringify(data) != storageStr) {
                    setItem(cacheKey, JSON.stringify(data));
                    callBackOnNewServerData(data, value);
                } 
//              else {
//              		callBackOnServerDataError(err);
//              }
            } else {
                if(true!=notAlertError){
                    api.toast({
                        msg: '获取信息失败'
                    });
                }
                callBackOnServerDataError(err);
            }
            if(true!=notHideProcess){
                api.refreshHeaderLoadDone();
            }
        });

    });
}

function getServerInfoUseCacheWithProgressNoDisplay(callBackOnNullData, callBackOnCacheData, callBackOnNewServerData,
                                           callBackOnServerDataError, url, getData,notAlertError,notHideProcess) {
    api.showProgress({});
    getServerInfoUseCache(
        callBackOnNullData,
        function(value){
            callBackOnCacheData(value);
            api.hideProgress();
        },
        function(data, value){
            callBackOnNewServerData(data, value);
            api.hideProgress();
        },function(){
            api.hideProgress();
            callBackOnServerDataError();
        },
        url, getData,notAlertError,notHideProcess);
}

function getServerInfoUseCacheWithProgress(callBackOnNullData, callBackOnCacheData, callBackOnNewServerData, 
	callBackOnServerDataError, url, getData,notAlertError,notHideProcess) {
    api.showProgress({});
    var isShowProgress = true;
	document.body.style.display = 'none';
	getServerInfoUseCache(
		callBackOnNullData,
		function(value){
			callBackOnCacheData(value);
			document.body.style.display = 'block';
			api.hideProgress();
			isShowProgress = false;
		},
		function(data, value){
			callBackOnNewServerData(data, value);
			if(isShowProgress == true){
				document.body.style.display = 'block';
				api.hideProgress();
			}
		}, function(){
            api.hideProgress();
            callBackOnServerDataError();
        },
		url, getData,notAlertError,notHideProcess);
}

function ajaxGet(url, getData, callBack) {
    var user = getUserInfo();
    getData.token = user.token;

//  alert(simpleVersion)
//  alert($api.getStorage(Storage_Update_Version))
//  alert($api.getStorage(Storage_Update_Version) != Storage_Update_Version_Value)
//  alert(simpleVersion && $api.getStorage(Storage_Update_Version) != Storage_Update_Version_Value ? 0 : 1)
    
    api.ajax({
        url: url,
        method: 'post',
        timeout: 60,
        dataType: 'json',
        returnAll: false,
        headers: {
        		"Accept-Encoding": "gzip",
        		"version" : version,
	        "type" : simpleVersion ? 0 : 1
        	},
        data: {
            values: addSignature(getData)
        }
    }, function (ret, err) {

        callBack(ret, err);
    });
}

function ajaxGetWithProgress(url, getData, callBack) {
	api.showProgress({});
	ajaxGet(url, getData, function(ret,err){
		callBack(ret, err);
		api.hideProgress();
	});
}

