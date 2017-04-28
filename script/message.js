//=====消息=====
//===========



//所有功能点
//1.维持长连接,OK
//2.接收到新数据存入到对应type_thirdId,OK
//4.更改首页消息按钮对应的总数字,OK
//5.更改消息列表里面的最后一条内容,OK,欠自己发送的
//6.如果有打开type_thirdId页面，往type_thirdId页面添加数据,ok
//7.拉取对应type_thirdId的消息历史,ok
//8.发送失败的列表,ok

//全局锁，防止数据乱 ok

//图片，语音，上传和删除ok
//List删除，标记已读，未读数ok
//chat删除ok


//首页长连接
//1.系统启动的时候就开启,长连接轮询,ok

//发送消息
//1.生成clientId，把消息写到本地,并且转圈。ok
//2.把消息写入到本地磁盘。把消息发送到服务器，如果服务器发送成功，修改本地数据的状态，本地的消息转圈去掉,ok
//3.如果服务器发送失败，转圈改为叹号。点击会触发检测逻辑，调用服务器的检测接口。ok

//检测逻辑（失败后再次发送）
//1.检测成功，删除本地队列，本地的消息转圈去掉OK
//2.检测失败，再次发送消息。OK

//展示消息
//1.先展示本地数据库的消息ok
//2.再从发送队列里面拿出消息来，展示到页面上ok
//3.拼接自己的消息，按照顺序展示到最后（如果发送成功，又没入库，说明这条消息之后的也都没收到，所以这条消息要展示到最后）。ok
//4.如果消息状态是未发送，展示为未发送，需要有叹号。ok

//收到消息
//1.判断是否我自己发送的消息ok
//2.如果是我自己发送的消息，忽略计数,忽略通知chatList,忽略通知chat，但是入本地库ok



//================公共方法，和messaeg框架没有关系，只是有公用key的关系======================
//设置当前的聊天页面。如果会话窗口被打开，则调用此方法
var user=getUserInfo();
var maxSize=500;
var im_messageListLock="unlock";
var im_mySendMessageListLock='unlock';
function setCurrentChatPage(type,thirdId){
    $api.setStorage("im_currentPage",{type:type,thirdId:thirdId});
}

//删除当前的聊天页面
function removeCurrentChatPage(){
    return $api.rmStorage("im_currentPage");
}

//获取当前的聊天页面
function getCurrentChatPage(){
    return $api.getStorage("im_currentPage");
}


//设置全局未读数
function setTotalUnreadNum(num){
    $api.setStorage("im_totalUnReadNum_"+user.id,num);
    api.execScript({
        name: rootWindowName,
        script: 'setPageMessageNum('+num+');'
    });
}

//获取全局未读数
function getTotalUnreadNum(){
    var num= $api.getStorage("im_totalUnReadNum_"+user.id);
    if(isBlack(num)){
        return 0;
    }else{
        return parseInt(num);
    }
}
//初始化
function initTotalUnreadNum(callBack){
    var allChatKey = "im_allMsgList";
    //首先，先整体情况到数据表中
    getItem(allChatKey, function (ret) {
        var storageStr = "[]";
        if (isNotBlack(ret.data)) {
            storageStr = ret.data;
        }
        var allChat = JSON.parse(storageStr);
        var totalNum = 0;
        for (var i = 0; i < allChat.length; i++) {
            totalNum = totalNum + allChat[i].unreadNum || 0;
        }
        setTotalUnreadNum(totalNum);
        callBack(totalNum);
    });
}

//修改全局未读数
function updateTotalUnreadNum(num){
    var old= getTotalUnreadNum();
    setTotalUnreadNum(old+num);
}






//获取个人发送中的消息{type:type,thirdId:thirdId,msg:msg,tempFile:[file1,file2]}
function getMySendMsgByClientId(clientId){
    var mySendMsgList= getMySendMsg();
    for(var i=0;i<mySendMsgList.length;i++){
        if(mySendMsgList[i].msg.clientId==clientId){
            return mySendMsgList[i];
        }
    }
    return null;
}

//获取个人发送中的消息{type:type,thirdId:thirdId,msg:msg,tempFile:[file1,file2]}
function getMySendMsg(){
    var mySendMsgList= $api.getStorage("im_mySendMsg_"+user.id);
    if(isBlack(mySendMsgList)){
        $api.setStorage("im_mySendMsg_"+user.id,[]);
        return [];
    }else{
        return mySendMsgList;
    }
}

//添加个人发送中的消息{type:type,thirdId:thirdId,msg:msg,tempFile:[file1,file2]}
function addMySendMsg(msg){
    api.sendEvent({
        name: 'im_mySendMsg_addMySendMsg',
        extra: {
            msg: msg
        }
    });
}

function _addMySendMsg(eventMsg){
    //alert(JSON.stringify("添加消息"+eventMsg));
    if(im_mySendMessageListLock!="lockIng") {
        im_mySendMessageListLock='lockIng';
        var msg=eventMsg.msg;
        //＝＝锁＝
        var mySendMsgList=getMySendMsg();
        mySendMsgList.push(msg);
        $api.setStorage("im_mySendMsg_"+user.id,mySendMsgList);
        //＝＝锁＝
        im_mySendMessageListLock='unLock';
    }else{
        setTimeout(function(){
//          toast("调试日志：addMySendMsg lock");
            _addMySendMsg(eventMsg);
        },50);
    }
}

function addTempFile(mySendMsg){
    var tempFiles=$api.getStorage("im_mysend_temp_files_"+user.id);
    if(isBlack(tempFiles)){
        tempFiles=[];
    }
    tempFiles.push(mySendMsg);
    $api.setStorage("im_mysend_temp_files_"+user.id,tempFiles);
}

function clearTempFile(type,thirdId){
    var tempFiles=$api.getStorage("im_mysend_temp_files_"+user.id);
    if(isBlack(tempFiles)){
        return;
    }
    var needClearFiles=[];
    var noMoreTempFile=false;
    while(!noMoreTempFile){
        noMoreTempFile=true;
        for(var i=0;i<tempFiles.length;i++){
            if(tempFiles[i].type==type&&tempFiles[i].thirdId==thirdId){
                if(tempFiles[i].tempFile){
                    for(var j=0;j<tempFiles[i].tempFile.length;j++){
                        needClearFiles.push(tempFiles[i].tempFile[j]);
                    }
                }
                tempFiles.splice(i, 1);
                noMoreTempFile=false;//splice后数组会变化。循环不好用了。
                break;
            }
        }
    }
    if(needClearFiles.length>0){
        var fs = api.require('fs');
        for(var j=0;j<needClearFiles.length;j++){
            fs.remove({
                path: needClearFiles[j]
            },function(ret,err){
            });
        }
    }

    $api.setStorage("im_mysend_temp_files_"+user.id,tempFiles);
}


//删除个人发送中的消息{type:type,thirdId:thirdId,msg:msg,tempFile:[file1,file2]}

function deleteMySendMsg(clientId){
    api.sendEvent({
        name: 'im_mySendMsg_deleteMySendMsg',
        extra: {
            clientId: clientId
        }
    });
}
function _deleteMySendMsg(eventMsg){
    if(im_mySendMessageListLock!="lockIng") {
        im_mySendMessageListLock='lockIng';
        var clientId=eventMsg.clientId;
        //＝＝锁＝
        var mySendMsgList=getMySendMsg();
        for(var i=0;i<mySendMsgList.length;i++){
            if(mySendMsgList[i].msg.clientId==clientId){
                if(mySendMsgList[i].tempFile){
                   addTempFile(mySendMsgList[i]);
                }
                //删除文件
                mySendMsgList.splice(i, 1);
                break;
            }
        }
        $api.setStorage("im_mySendMsg_"+user.id,mySendMsgList);
        //＝＝锁＝
        im_mySendMessageListLock='unLock';
    }else{
        setTimeout(function(){
//          toast("调试日志：deleteMySendMsg lock");
            _deleteMySendMsg(eventMsg);
        },50);
    }
}

function updateMySendMsgAddTempFile(clientId,tempFile){
    api.sendEvent({
        name: 'im_mySendMsg_updateMySendMsgAddTempFile',
        extra: {
            clientId: clientId,
            tempFile:tempFile
        }
    });
}


//添加tempFile{type:type,thirdId:thirdId,msg:msg,tempFile:[file1,file2]}
function _updateMySendMsgAddTempFile(eventMsg){
    if(im_mySendMessageListLock!="lockIng") {
        im_mySendMessageListLock='lockIng';
        var clientId=eventMsg.clientId;
        var tempFile=eventMsg.tempFile;
        //＝＝锁＝
        var mySendMsgList=getMySendMsg();
        for(var i=0;i<mySendMsgList.length;i++){
            if(mySendMsgList[i].msg.clientId==clientId){
                if(isBlack(mySendMsgList[i].tempFile)){
                    mySendMsgList[i].tempFile=[];
                }
                mySendMsgList[i].tempFile.push(tempFile);
                break;
            }
        }
        $api.setStorage("im_mySendMsg_"+user.id,mySendMsgList);
        //＝＝锁＝
        im_mySendMessageListLock='unLock';
    }else{
        setTimeout(function(){
//          toast("调试日志：_updateMySendMsgAddTempFile lock");
            _updateMySendMsgAddTempFile(eventMsg);
        },50);
    }
}

function updateMySendMsg(clientId,status){
    api.sendEvent({
        name: 'im_mySendMsg_updateMySendMsg',
        extra: {
            clientId: clientId,
            status:status
        }
    });
}

//更新状态个人发送中的消息{type:type,thirdId:thirdId,msg:msg,tempFile:[file1,file2]}
function _updateMySendMsg(eventMsg){
    if(im_mySendMessageListLock!="lockIng") {
        im_mySendMessageListLock='lockIng';
        //＝＝锁＝
        var clientId=eventMsg.clientId;
        var status=eventMsg.status;
        var mySendMsgList=getMySendMsg();
        for(var i=0;i<mySendMsgList.length;i++){
            if(mySendMsgList[i].msg.clientId==clientId){
                mySendMsgList[i].msg.status=status;
                break;
            }
        }
        $api.setStorage("im_mySendMsg_"+user.id,mySendMsgList);
        //＝＝锁＝
        im_mySendMessageListLock='unLock';
    }else{
        setTimeout(function(){
//          toast("调试日志：updateMySendMsg lock");
            _updateMySendMsg(eventMsg);
        },50);
    }
}


//通知消息列表页 更新数据
function noticeChatListUpdate(){
    api.execScript({
        name: "chatList",
        frameName:"chatList_body",
        script: 'addNewMessage();'
    });
}

//通知当前的会话页面，添加数据
function noticeChatAddMessage(msg){
    api.sendEvent({
        name: 'chatNewMessagesFromServerEvent',
        extra: {
            type: msg.chatInfo.type,
            thirdId: msg.chatInfo.thirdId,
            msg:msg
        }
    });
}


//聊天列表页面  获取当前系统内的所有的消息类型，以及对应的最后一条数据，按照最后一条的时间排序。
//    type:thisChat.type,
//    thirdId:thisChat.thirdId,
//    lastMsg:thisChat.data[0],
//    lastIndex:thisChat.data[0].index,
//    name:thisChat.name,
//    icon:thisChat.icon,
//    unreadNum:thisChat.data.length

function getAllChatInfo(callBack){
    var allChatKey="im_allMsgList";
    getItem(allChatKey,function(ret){
        var storageStr = "[]";
        if (isNotBlack(ret.data)) {
            storageStr = ret.data;
        }
        var allChat = JSON.parse(storageStr);
        toast("get allChat:"+allChat.length);
        allChat.sort(function (a, b) {
            return b.lastIndex - a.lastIndex
        });
        callBack(allChat);
    });
}

//将chatList页面的某项未读数清0
function cleanChatUnreadNUm(type,thirdId){
    updateChatListInfo(type,thirdId,null,0);
}

function updateChatListInfo(type,thirdId,lastMsg,unreadNum){
    api.sendEvent({
        name: 'im_updateChatListInfo',
        extra: {
            type: type,
            thirdId:thirdId,
            lastMsg:lastMsg,
            unreadNum:unreadNum
        }
    });
}

//修改chatList页面的信息
function _updateChatListInfo(eventMsg){
    if(im_messageListLock!="lockIng") {
        im_messageListLock="lockIng";
        var type=eventMsg.type;
        var thirdId=eventMsg.thirdId;
        var lastMsg=eventMsg.lastMsg;
        var unreadNum=eventMsg.unreadNum;

        _innerUpdateChatListInfo(type,thirdId,unreadNum,lastMsg,function(){
            im_messageListLock="unlock";
        });

    }else{
        setTimeout(function(){
//          toast("调试日志：_updateChatListInfo lock");
            _updateChatListInfo(eventMsg);
        },50);
    }
}






var size=20;
function getChatData(type,thirdId,cursor,callBack){
    var key="im_msgList_"+type+"_"+thirdId;
    getItem(key,function(ret){
        var storageStr = "[]";
        if (isNotBlack(ret.data)) {
            storageStr = ret.data;
        }
        var value = JSON.parse(storageStr);
        var result=[];
        if(cursor==0){
            //先取出本人发送的消息
            var mySendMsgList=getMySendMsg();
                //alert(JSON.stringify(mySendMsgList));
            var nowTime=new Date().getTime();
            if(mySendMsgList.length>0){
                for(var i=mySendMsgList.length-1;i>0;i--){
                    //alert(JSON.stringify(mySendMsgList[i]))
                    var myMsg=mySendMsgList[i].msg;
                    //alert(JSON.stringify(myMsg));
                    if(mySendMsgList[i].type!=type||mySendMsgList[i].thirdId!=thirdId){

                        if(myMsg.status=='ok'&&nowTime-myMsg.time>3600000){
                            //如果消息已经发送成功了很长时间，那么删除掉。  防止丢消息导致该消息一直出现
                            deleteMySendMsg(myMsg.clientId);
                        }
                        continue;
                    }
                    if(myMsg.status=='ok'&&nowTime-myMsg.time>3600000){
                        //如果消息已经发送成功了很长时间，那么删除掉。  防止丢消息导致该消息一直出现
                        deleteMySendMsg(myMsg.clientId);
                    }else if(myMsg.status=='sending'){
                        //发送中的消息，那么展示为发送失败
                        //updateMySendMsg(mySendMsgList[i].clientId,'fail');
                        myMsg.status='fail';
                        result.push(myMsg);
                    }else{
                        result.push(myMsg);
                    }
                }
            }

            //取最近20条
            for(var i=0;i<20&&i<value.length;i++){
                result.push(value[i]);
            }
            callBack(result);
            clearTempFile(type,thirdId);
        }else{
            var cacheData=false;
            if(value.length>0){
                var startIndex=-1;
                for(var i=0;i<value.length;i++){
                    if(value[i].index==cursor){
                        startIndex=i+1;
                        break;
                    }
                }
                if(startIndex>0&&startIndex<value.length){
                    cacheData=true;
                    var endIndex=startIndex+size;
                    if(endIndex>=value.length){
                        endIndex=value.length;
                    }
                    result=value.slice(startIndex,endIndex);
                    callBack(result);
                    //alert(JSON.stringify(result));

                }
            }


            //var listCursor=[];
            //for(var i=0;i<value.length;i++){
            //    listCursor.push(value[i].index);
            //}
            //alert("type:"+type+",thirdId:"+thirdId+",listCursor:"+JSON.stringify(listCursor));
            //alert("cacheData:"+cacheData+".cursor:"+cursor+",result"+result.length);

            if(!cacheData){
                var getData={type:type,thirdId:thirdId};
                getData.token =user.token;
                getData.cursor=cursor;
                getData.size=30;
                getData.uid = user.id;
                //alert(JSON.stringify(getData))
                ajaxGet(message_pagerUrl,getData,function(ret,err){
                    //toast("server.cursor:"+cursor+",ret."+JSON.stringify(ret)+",err"+JSON.stringify(err));
                    if(ret&&ret.data){
                        var serverResult=ret.data;
                        if(serverResult.length==0){
                            callBack([]);
                        }else{
                            for(var i=0;i<size&&i<serverResult.length;i++){
                                result.push(serverResult[i]);
                            }
                            callBack(result);
                            saveOldData(type,thirdId,serverResult);
                        }
                    }else{
                        callBack([]);
                    }
                });
            }
        }

    });
}




//获取新的客户端消息序列号
function getNewClientMsgId(){
    var imClientMsgId=$api.getStorage('imClientMsgId');
    if(isBlack(imClientMsgId)){
        //var random= 100000+Math.floor(Math.random()*100000);
        var base=''+new Date().getTime()+'000000';
        imClientMsgId=base;
    }
    var imClientMsgIdBase=imClientMsgId.substr(0,imClientMsgId.length-6);
    var imClientMsgIdSort=imClientMsgId.substr(imClientMsgId.length-6,imClientMsgId.length);
    imClientMsgId=''+imClientMsgIdBase+(parseInt(imClientMsgIdSort)+1);
    $api.setStorage('imClientMsgId',imClientMsgId);
    return imClientMsgId;
}


function deleteChatList(type,thirdId){
    api.sendEvent({
        name: 'im_deleteChatList',
        extra: {
            type: type,
            thirdId:thirdId
        }
    });
}

function _deleteChatList(eventMsg){
    if(im_messageListLock!="lockIng") {
        im_messageListLock="lockIng";
        var key = "im_allMsgList";
        var type=eventMsg.type;
        var thirdId=eventMsg.thirdId;
        getItem(key, function (ret) {
            var storageStr = "[]";
            if (isNotBlack(ret.data)) {
                storageStr = ret.data;
            }
            var value = JSON.parse(storageStr);
            for(var i=0;i<value.length;i++){
                if(value[i].thirdId == thirdId && value[i].type == type){
                    value.splice(i, 1);
                }
            }
            setItem(key, JSON.stringify(value), function (ret, err) {
                var listDataKey = "im_msgList_" + type + "_" + thirdId;
                removeItem(listDataKey,function(){
                    im_messageListLock="unLock";
                });
            });
        });
    }else{
        setTimeout(function(){
//          toast("调试日志：deleteChatList lock");
            _deleteChatList(eventMsg);
        },50);
    }
}

function deleteChatMessage(type,thirdId,id) {
    api.sendEvent({
        name: 'im_deleteChatMessage',
        extra: {
            type: type,
            thirdId:thirdId,
            id:id
        }
    });
}

function _deleteChatMessage(eventMsg){
    if(im_messageListLock!="lockIng") {
        im_messageListLock="lockIng";
        var type=eventMsg.type;
        var thirdId=eventMsg.thirdId;
        var id=eventMsg.id;
        ajaxGet(message_deleteUrl,{type:type,thirdId:thirdId,mid:id},doNothing);
        var key = "im_msgList_" + type + "_" + thirdId;
        getItem(key, function (ret) {
            var storageStr = "[]";
            if (isNotBlack(ret.data)) {
                storageStr = ret.data;
            }
            var value = JSON.parse(storageStr);
            var isLastMsg=false;
            for(var i=0;i<value.length;i++){
                if(value[i].id==id){
                    value.splice(i, 1);
                    if(i==0){
                        isLastMsg=true;
                    }
                }
            }

            setItem(key, JSON.stringify(value), function (ret, err) {
                if(isLastMsg&&value.length>0){
                    _innerUpdateChatListInfo(type,thirdId,0,value[0],function(){
                        im_messageListLock="unLock";
                    });
                }else{
                    im_messageListLock="unLock";
                }

            });
        });
    }else{
        setTimeout(function(){
//          toast("调试日志：deleteChatMessage lock");
            _deleteChatMessage(eventMsg);
        },50);
    }
}



function _innerUpdateChatListInfo(type,thirdId,unreadNum,lastMsg,callBack){
    var allChatKey = "im_allMsgList";
    getItem(allChatKey, function (ret) {
        var storageStr = "[]";
        if (isNotBlack(ret.data)) {
            storageStr = ret.data;
        }
        var totalNum=getTotalUnreadNum();
        var allChat = JSON.parse(storageStr);
        //toast("update allChat:"+allChat.length);
        var oldNum = 0;
        for (var i = 0; i < allChat.length; i++) {
            if (allChat[i].type == type && allChat[i].thirdId == thirdId) {
                oldNum = allChat[i].unreadNum;
                allChat[i].unreadNum = unreadNum;
                if (isNotBlack(lastMsg)) {
                    allChat[i].lastMsg = lastMsg;
                }
                totalNum=totalNum-oldNum;
                if(totalNum<=0){totalNum=0;}
            }
        }

        setItem(allChatKey, JSON.stringify(allChat), function (ret, err) {
            im_messageListLock="unlock";
            //重新设置总数
            setTotalUnreadNum(totalNum);
            api.execScript({
                name: "chatList",
                frameName:"chatList_body",
                script: 'addNewMessage();'
            });
            if(callBack){
                callBack();
            }
        });
    });
}

function saveOldData(type,thirdId,msgs) {
    api.sendEvent({
        name: 'im_saveOldData',
        extra: {
            type: type,
            thirdId:thirdId,
            msgs:msgs
        }
    });
}


function _saveOldData(eventMsg){
    if(im_messageListLock!="lockIng") {
        im_messageListLock="lockIng";
        var type=eventMsg.type;
        var thirdId=eventMsg.thirdId;
        var msgs=eventMsg.msgs;

        var key = "im_msgList_" + type + "_" + thirdId;
        getItem(key, function (ret) {
            var storageStr = "[]";
            if (isNotBlack(ret.data)) {
                storageStr = ret.data;
            }
            var value = JSON.parse(storageStr);
            if (value.length > maxSize) {
                im_messageListLock='unLock';
            } else {

                var lastIndex=0;
                if(value.length>0){
                    lastIndex=value[value.length-1].index;
                }
                for (var i = 0; i < msgs.length; i++) {
                    if(lastIndex>0&&msgs[i].index<lastIndex){
                        value.push(msgs[i]);
                    }
                }
                setItem(key, JSON.stringify(value), function (ret, err) {
                    im_messageListLock='unLock';
                });
            }
        });
    }else{
        setTimeout(function(){
//          toast("调试日志：saveOldData lock");
            _saveOldData(eventMsg);
        },50);
    }
}


function sendMsgToServer(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError){
    callBackWhenLocal(msg);
    uploadAndSendMsg(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError,true);

}


function uploadAndSendMsg(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError,addToMySendList){
    var msgContain=(msg);
   // alert(JSON.stringify("uploadAndSendMsg"+JSON.stringify(msgContain)));
    //上传图片或者语音
    //1.压缩图片
    //2.上传图片
    //3.删除压缩图片
    //4.接收到消息后把文件加入到要删除的列表

    if(isNotBlack(msgContain.messageChat.picture)){
        var picture=msgContain.messageChat.picture;
        if(addToMySendList){
            addMySendMsg({type:type,thirdId:thirdId,msg:msg,tempFile:[picture.url]});
        }
        compressImage(picture.size||0,0,picture.url,function(ret){
            if(addToMySendList){
                updateMySendMsgAddTempFile(msg.clientId,ret.path);
            }
            api.hideProgress();
            uploadFile(ret.path,function(ret){
                if(ret.status){
                    msgContain.messageChat.picture = ret.result;
                    //msg.message=(msgContain);
                    _sendMsgToServer(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError);
                }else{
                    callBackWhenError(msg);
                }
            });
        });
    }else if(isNotBlack(msgContain.messageChat.voice)){
        //alert("voice")
        var voice=msgContain.messageChat.voice;

        if(addToMySendList) {
            addMySendMsg({type: type, thirdId: thirdId, msg: msg, tempFile: [voice]});
        }
        uploadFile(voice,function(ret){
            //alert("uploadVoice"+JSON.stringify(ret));
            if(ret.status){
                voice=ret.result;
                msgContain.messageChat.voice=voice;
                //msgContain.messageChat.voiceDuration = msgContain.voiceDuration;
                //msgContain.messageChat.voiceDuration=voice;
                //msg.message=msgContain;
               // alert(msgContain);
                _sendMsgToServer(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError);
            }else{
                callBackWhenError(msg);
            }
        },uploadVoiceUrl);

    }else{
        if(addToMySendList) {
            addMySendMsg({type: type, thirdId: thirdId, msg: msg});
        }
        _sendMsgToServer(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError);
    }
}

function _sendMsgToServer(type,thirdId,msg,callBackWhenLocal,callBackWhenSuccess,callBackWhenError){
    var msgContain=msg.messageChat;

    var getData={clientId:msg.clientId,uid:getUserInfo().id,type:type,thirdId:thirdId,word:msgContain.word,voice:msgContain.voice,picture:msgContain.picture};

    //语音单独处理，多上传一个时长
    if(isNotBlack(msgContain.voice)){
       // alert("语音")
        getData.voiceDuration = msgContain.voiceDuration;
        getData.voice = msgContain.voice;
    }
    //alert("上传"+JSON.stringify(getData));
    //alert("上传msg"+JSON.stringify(msg));

    ajaxGet(message_chatUrl,getData,function(ret,err){
        if(ret&&ret.success==true){
            updateMySendMsg(msg.clientId,"ok");
            callBackWhenSuccess(msg);
        }else{
            updateMySendMsg(msg.clientId,"fail");
            callBackWhenError(msg);
        }
    });
}



function checkMsgToServer(type,thirdId,clientId,callBackWhenSuccess,callBackWhenError){
    var mySendMsg=getMySendMsgByClientId(clientId);//从发送中的数据去取一个
    if(isBlack(mySendMsg)){//已经收到，会把发送中的数据给清除
        callBackWhenSuccess({clientId:clientId});
        return;
    }
    var msg=mySendMsg.msg;
    var msgContain=(msg.messageChat);
    var getData={clientId:msg.clientId,type:type,thirdId:thirdId,word:msgContain.word,voice:msgContain.voice,pictures:msgContain.pictures};

    ajaxGet(message_checkChatUrl,getData,function(ret,err){
        if(ret&&ret.success==true){
            updateMySendMsg(msg.clientId,"ok");
            callBackWhenSuccess(msg);
        }else{
            uploadAndSendMsg(type,thirdId,msg,doNothing,callBackWhenSuccess,callBackWhenError);
        }
    });
}










//================公共方法，和messaeg框架没有关系，只是有公用key的关系（结束）======================
var _options={
    getData:{},//数据
    user:user,
    errorTimes:0,//出错次数，每失败一次+1，每成功一次清0.失败的越多，重试的时间越长。
    maxRetryTime:100000,//最大重试时间100秒
    retryTime:200//重试时间200毫秒
    //回调有新消息，返回新
};

var _message;

function Message(options){
    api.addEventListener({
        name: 'im_updateChatListInfo'
    }, function( ret, err ){
        _updateChatListInfo(ret.value);
    });


    api.addEventListener({
        name: 'im_deleteChatList'
    }, function( ret, err ){
        _deleteChatList(ret.value);
    });

    api.addEventListener({
        name: 'im_deleteChatMessage'
    }, function( ret, err ){
        _deleteChatMessage(ret.value);
    });

    api.addEventListener({
        name: 'im_saveOldData'
    }, function( ret, err ){
        _saveOldData(ret.value);
    });

    api.addEventListener({
        name: 'im_mySendMsg_addMySendMsg'
    }, function( ret, err ){
        _addMySendMsg(ret.value);
    });

    api.addEventListener({
        name: 'im_mySendMsg_deleteMySendMsg'
    }, function( ret, err ){
        _deleteMySendMsg(ret.value);
    });

    api.addEventListener({
        name: 'im_mySendMsg_updateMySendMsgAddTempFile'
    }, function( ret, err ){
        _updateMySendMsgAddTempFile(ret.value);
    });


    api.addEventListener({
        name: 'im_mySendMsg_updateMySendMsg'
    }, function( ret, err ){
        _updateMySendMsg(ret.value);
    });




    for(var o in options){
        _options[o]=options[o];
    }
    for(var o in _options){
        this[o]= _options[o];
    }
    _message=this;
}




Message.prototype.setIndex=function(index){
    var indexKey=user.id+"_messageIndex";
    $api.setStorage(indexKey,index);
};

Message.prototype.getIndex=function(){
    var indexKey=user.id+"_messageIndex";
    var index=$api.getStorage(indexKey);
    if(isBlack(index)){
        return "0";
    }else{
        return index;
    }
};

//获取重试的时间
Message.prototype.getRetryTime=function(){
    if(_message.errorTimes==0){
        return _message.retryTime;
    }else{
        var retryTime=_message.retryTime*_message.errorTimes;
        if(retryTime>_message.maxRetryTime){
            return _message.maxRetryTime;
        }else{
            return retryTime;
        }

    }
};




//存储单个聊天的消息
//如果有更多，清除掉原来的消息。如果没有更多，往里面添加数据。
Message.prototype.saveMessage=function(msgs,callBack){
    if(msgs.length==0){
        callBack({status:true},{});
        return;
    }

    if(im_messageListLock!="lockIng") {
        im_messageListLock="lockIng";

        var allChatKey = "im_allMsgList";
        //首先，先整体情况到数据表中
        getItem(allChatKey, function (ret) {
            var storageStr = "[]";
            if (isNotBlack(ret.data)) {
                storageStr = ret.data;
            }
            var allChat = JSON.parse(storageStr);
            for (var k = 0; k < msgs.length; k++) {
                var thisChat = msgs[k];
                var dbOldChatInfo;
                for (var l = 0; l < allChat.length; l++) {
                    if (allChat[l].thirdId == thisChat.thirdId && allChat[l].type == thisChat.type) {
                        //alert(JSON.stringify(dbOldChatInfo));
                        dbOldChatInfo=allChat[l];
                        break;
                    }
                }
                var unreadNum=0;
                for(var q=0;q<thisChat.data.length;q++){
                    if(thisChat.data[q].authorId!=user.id){
                        unreadNum=unreadNum+1;
                    }
                }
                if (dbOldChatInfo) {
                    dbOldChatInfo.lastMsg = thisChat.data[0];
                    dbOldChatInfo.lastIndex = thisChat.data[0].index;
                    dbOldChatInfo.thirdNick = thisChat.thirdNick;
                    dbOldChatInfo.thirdIcon = thisChat.thirdIcon;
                    dbOldChatInfo.time = thisChat.data[0].time;
                    dbOldChatInfo.unreadNum = dbOldChatInfo.unreadNum + unreadNum;
                } else {
                    var chatInfo = {};
                    chatInfo = {
                        type: thisChat.type,
                        thirdId: thisChat.thirdId,
                        lastMsg: thisChat.data[0],
                        lastIndex: thisChat.data[0].index,
                        thirdNick: thisChat.thirdNick,
                        time: thisChat.data[0].time,
                        thirdIcon: thisChat.thirdIcon,
                        unreadNum: unreadNum
                    };
                    allChat.push(chatInfo);
                }
                //alert(JSON.stringify(allChat));
            }
            setItem(allChatKey, JSON.stringify(allChat), function (ret, err) {
                //开始保存所有的消息。
                var j = 0;
                var hasCall = false;
                for (var n = 0; n < msgs.length; n++) {
                    var msg = msgs[n];
                    (function (msg) {
                        var key = "im_msgList_" + msg.type + "_" + msg.thirdId;
                        if (msg.more == true) {
                            removeItem(key, function () {
                                setItem(key, JSON.stringify(msg.data), function (ret, err) {
                                    j++;
                                    if (j == msgs.length && !hasCall) {
                                        hasCall = true;
                                        callBack({status: true}, {});
                                        im_messageListLock='unLock';
                                    }
                                });
                            });
                        } else {
                            getItem(key, function (ret) {
                                var storageStr = "[]";
                                if (isNotBlack(ret.data)) {
                                    storageStr = ret.data;
                                }
                                //alert("key:"+key+":"+storageStr);
                                var value = JSON.parse(storageStr);
                                for (var i = msg.data.length - 1; i >= 0; i--) {
                                    value.unshift(msg.data[i]);
                                }

                                while (true) {
                                    if (value.length > maxSize) {
                                        value.pop();
                                    } else {
                                        break;
                                    }
                                }
                                setItem(key, JSON.stringify(value), function (ret, err) {
                                    j++;
                                    if (j == msgs.length && !hasCall) {
                                        hasCall = true;
                                        callBack({status: true}, {});
                                        im_messageListLock='unlock';
                                    }

                                });

                            });
                        }
                    })(msg);
                }
            });
        });
    }else{
        setTimeout(function(){
//          toast("调试日志：_message lock");
            _message.saveMessage(msgs,callBack);
        },50);
    }
};


Message.prototype.connect=function(){
    var getData={};
    getData.token =user.token;
    getData.lastIndex=_message.getIndex();
    getData.uid = user.id;
    //alert(JSON.stringify(getData))
    api.ajax({
        url: message_connectUrl,
        method: 'post',
        timeout: 110,
        data: {
            values: addSignature(getData)
        },
        dataType: 'json',
        returnAll: false,
        headers:{"Accept-Encoding":"gzip"}
    }, function (ret, err) {
      // alert("获取新消息"+JSON.stringify(ret));
        if (ret) {
            _message.errorTimes=0;
            
         // alert(JSON.stringify(ret));
            
            if (isNotBlack(ret.notices)) {

            		for(var n = 0; n < ret.notices.length;n++){
            			var notice = ret.notices[n];
            			
            			//匿名圈
	            		if(notice.type == 1) {
	            			var ids = $api.getStorage(Storage_Tucao_Notice_Ids);
	            			
	            			if(!ids || ids.length == 0){
	            				ids = [];
	            			} else {
	            				ids = JSON.parse(ids);
	            			}
	            			
	            			var newIds = [];
	            			var items = notice.items;
	            			//消重
	            			for(var k = 0;k < items.length;k++){
	            				var item = items[k];
	            				if(ids.contains(item.id)){
	            					ids.remove(item.id);
	            				}	
	            				newIds.push(item.id);
	            			}
	            			
	            			ids = newIds.concat(ids);
	            			
//	            			alert(JSON.stringify(ids));
	            			
	            			if(ids.length > 0){
	            				$api.setStorage(Storage_Tucao_Notice_Ids,JSON.stringify(ids));
	            			}
	            			
	            			api.execScript({
	            				name: rootWindowName,
	    						script: 'setUserNotice(true);'
	            			});
	            		} else if (notice.type == 2) {
	            			//校园宝活动通知
	            			$api.setStorage(Storage_School_Active_Notice,"true");
	            		}
            		}
            		
            }



            if(ret.streams.length > 0){
                _message.saveMessage(ret.streams,function(){
                    _message.setIndex(ret.maxStreamIndex);

                    //判断是否是自己的消息
                    var needToNoticMsg=[];

                    for(var i=0;i<ret.streams.length;i++){
                        if(ret.streams[i].data.length>0){
                            for(var j=ret.streams[i].data.length-1;j>=0;j--){
                                //alert(ret.streams[i].data[j].authorId);alert(user.id);
                                if(user.id!=ret.streams[i].data[j].authorId){

                                    var needToNoticData=ret.streams[i].data[j];
                                    needToNoticData.chatInfo={type:ret.streams[i].type,thirdId:ret.streams[i].thirdId};
                                    needToNoticMsg.push(needToNoticData);
                                    //别人的消息加个红点
                                    setRedPoint();
                                }else{
                                    _deleteMySendMsg({clientId:ret.streams[i].data[j].clientId});
                                }
                            }
                        }
                    }

                    //增加未读数字
                    var num=needToNoticMsg.length;
                    //通知主页面修改数字
                    if(num>0){
                        updateTotalUnreadNum(num);
                        //通知消息列表有新消息
                        noticeChatListUpdate();
                        //通知当前会话页面，来了新的消息
                        var currentChatPage= getCurrentChatPage();
                        if(isNotBlack(currentChatPage)){
                            for(var i=0;i<needToNoticMsg.length;i++){
                                if(needToNoticMsg[i].chatInfo.type==currentChatPage.type
                                &&needToNoticMsg[i].chatInfo.thirdId==currentChatPage.thirdId){
                                    noticeChatAddMessage(needToNoticMsg[i]);
                                }
                            }

                        }
                    }


                    setTimeout(function(){
                        _message.connect();
                    },0);
                });
            } else{
                setTimeout(function(){
                    _message.connect();
                },0);
            }
        } else {
            _message.errorTimes=_message.errorTimes+1;
            //出错后200毫秒重新请求一次,如果一段时间内网络有问题，改成5秒执行一次。
            setTimeout(function(){
                //alert("再次执行，错误或者没有数据");
                _message.connect();
            },_message.getRetryTime());
        }
    });
};
