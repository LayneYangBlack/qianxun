//======================系统初始化（开始）=============================
function systemInit(callBack){
    initDb(function (ret, err) {
        if (ret.status) {
            initFs(function (ret) {
                if (ret.status || ret.exist) {
                    //判断是否第一次打开
                    initShowGuide(function(){
                        //初始化用户
                        initUser(function(){
                            //初始化系统信息
                            initSystemInfo(function(){
                                initOther(function(){
                                    openTab('home');
                                    //initUserPage(function(isOpen){
                                    //    if(isOpen != 2){
                                    //        openTab('home');
                                    //    }else{
                                    //        openNewWindow('mallDetail','./html/mall/mallDetail.html',{},{slidBackEnabled:false})
                                    //    }
                                    //    if(callBack){
                                    //        callBack();
                                    //    }
                                    //});
                                });


                            });
                        });
                    });
                } else {
                    api.alert({msg: "无法建立本地文件夹"});
                }
            });
        } else {
            api.alert({msg: "数据库加载错误:" + JSON.stringify(err)});
        }
    });
}

var callbackMethod;
function initShowGuide(callback){
    //判断是否第一次打开
    var showGuide = $api.getStorage(isShowGuide);
    if (!showGuide || isTest) {
        callbackMethod = callback;
        openFrame('guide','./html/guide/guide.html',{},0,0);
    } else {
        callback();
    }
}
function runCallback(){
    if(callbackMethod){
        callbackMethod();
    }
}

function initUser(callback){
    var user = getUserInfo();
    if(isCleanUser == true){
        user = null;
    }
    if (isBlack(user)) {
        getVisitor(function () {
            callback();
        });
    } else {
        callback();
    }
}

function initSystemInfo(callBack){
    if($api.getStorage(isInit)){
        _initSystemInfo();//异步刷新系统信息
        callBack();
    } else {
        api.showProgress({
            style: 'default',
            animationType: 'fade',
            title: '系统初始化中...',
            modal: true
        });
        _initSystemInfo(function(){
            api.hideProgress();
            callBack();
        });
    }
}


function _initSystemInfo(callback){

    ajaxGet(initSystemInfoUrl,{},function(ret,err){
        if(isNotBlack(ret)){
            if(ret.carouselList.length > 0){
                $api.setStorage("carouselList",ret.carouselList);
            }
            if(ret.categoryList.length > 0){
                var categoryList = ret.categoryList;
                var allResult = {};
                for(var i=0;i<categoryList.length;i++){
                    allResult[categoryList[i].id]=categoryList[i];
                }
                $api.setStorage("categoryList",allResult);
                $api.setStorage("categoryData",ret.categoryList);
            }
            if(callback){
                callback();
            }
        }else{
            if(callback){
                api.confirm({
                    title: '当前网络或服务有问题',
                    msg: '是否重试？',
                    buttons:['确定', '取消']
                },function(ret,err){
                    if(ret.buttonIndex == 1){
                        _initSystemInfo(callback);
                    }else{
                        closeApp();
                    }
                });
            }
        }
    });
}


function initOther(callBack){
    //上传我的位置
    var map = api.require('bMap');
    map.getLocation({
        accuracy: '100m',
        autoStop: true,
        filter: 1
    }, function(ret, err){
        if(ret.status){
            $api.setStorage("localPoint",ret);
        }
    })
    var sendCoordinate = setInterval(function(){
        map.getLocation({
            accuracy: '100m',
            autoStop: true,
            filter: 1
        }, function(ret, err){
            if(ret.status){
                $api.setStorage("localPoint",ret);
            }
        })

    },3*60*1000);

    if(callBack){
        callBack();
    }


}




function getVisitor(callback){

    api.ajax({
        url: loginVisitorUrl,
        method: 'post',
        timeout: 60,
        dataType: 'json',
        returnAll: false,
        headers: {
            "Accept-Encoding": "gzip",
            "version" : version,
            "type" :   1
        },
        data: {}
    }, function (ret, err) {
        if(isNotBlack(ret) && ret.token){
            user = ret;
            setUserInfo(user);
            callback();
        }else{
            api.confirm({
                title: '当前网络或服务有问题',
                msg: '是否重试？',
                buttons:['确定', '取消']
            },function(ret,err){
                if(ret.buttonIndex == 1){
                    getVisitor(callback);
                }else{
                    closeApp();
                }
            });
        }
    });
}






//======================系统初始化（结束）=============================





//======================下方tab栏目切换（开始）=============================

var prevPid;//上一个tab
var curPid;//当前tab
var frameArr = [];//打开的列表
//各个栏目


//点击切换tab标签
function openTab(type) {

    if (!type) {
        return;
    }
    if ( type == 'user') {
        var isCheck = checkUserLogin('./html/login/login.html');
        if(!isCheck){
            return;
        }
    }


    if ( type == 'news') {
        var isCheck = checkUserLogin('./html/login/login.html');
        if(!isCheck){
            return;
        }
    }

    //切换样式
    var header = $api.dom('#header .active');//对应头部的样式
    $api.removeCls(header, 'active');
    var thisHeader = $api.dom('#header .' + type);
    $api.addCls(thisHeader, 'active');
    var actTab = $api.dom('#nav .active');//对应底部的样式
    $api.removeCls(actTab, 'active');
    var thisTab = $api.dom('#nav .' + type);
    thisTab = thisTab.parentNode;
    $api.addCls(thisTab, 'active');


    //record page id
    prevPid = curPid;
    curPid = type;
//是否打开过
    function isOpened(frmName) {
        var i = 0, len = frameArr.length;
        for (i; i < len; i++) {
            if (frameArr[i] == frmName) {
                return true;
            }
        }
        return false;
    }

    if (prevPid != curPid) {
        if (isOpened(type)) {
            //打开已经打开过的页面
            if (tabs[type].isGroup) {
                api.setFrameGroupAttr({
                    name: type,
                    hidden: false
                });
            } else {
                api.setFrameAttr({
                    name: type,
                    hidden: false
                });
            }

        } else {
            //打开新页面
            if (tabs[type].isGroup) {
                api.openFrameGroup(tabs[type].group, function (ret, err) {
                    tabs[type].groupCallBack(ret);
                });
            } else {
                api.openFrame(tabs[type].frame);
            }
  
            frameArr.push(type);  
        }

        if (prevPid) {
            //关闭前一个页面
            if (tabs[prevPid].isGroup) {
                api.setFrameGroupAttr({
                    name: prevPid,
                    hidden: true
                });
            } else {
                api.setFrameAttr({
                    name: prevPid,
                    hidden: true
                });
            }

        }
    }

};


//是否打开过
function isOpened(frmName) {
    var i = 0, len = frameArr.length;
    for (i; i < len; i++) {
        if (frameArr[i] == frmName) {
            return true;
        }
    }
    return false;
}


//======================下方tab栏目切换（结束）=============================
