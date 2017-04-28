var db; //数据库对象（需要调用init方法）

//初始化数据库
function initDb(callBack) {
    db = api.require('db');
    db.openDatabase({
        name: 'app',
        path:'fs://youhuipai.db'
    }, function (ret, err) {
        if (ret.status) {
            db.executeSql({
                name: 'app',
                sql: 'drop table if exists app1 ;'//测试时候用。
            }, function (ret, err) {
                if (ret.status) {
                    db.executeSql({
                        name: 'app',
                        sql: 'CREATE TABLE  if not exists app(key varchar(255), value varchar(55235));'
                    }, function (ret, err) {
                        if (ret.status) {
                            db.executeSql({
                                name: 'app',
                                sql: 'create unique index  if not exists index1 on app(key);'
                            }, function (ret, err) {
                                if(callBack) {
                                    callBack(ret, err);
                                }
                            });
                        } else {
                            if(callBack) {
                                callBack(ret, err);
                            }
                        }
                    });

                } else {
                    if(callBack) {
                        callBack(ret, err);
                    }
                }
            });

        } else {
            if(callBack) {
                callBack(ret, err);
            }
        }
    });
}


function cleanDb(callBack) {
    db = api.require('db');
    db.executeSql({
    		name: 'app',
        sql: 'drop table if exists app ;'
    }, function (ret, err) {
		if (ret.status) {
            if(callBack) {
            		callBack(ret, err);
            }
        }
	});
}


//==构建一个key类型的存储
//==需要在系统初始化的时候initdb
function setItem(key, value, callback) {
    var uid=''+getUserInfo().id;
    key=uid+key;
    //alert("存消息"+JSON.stringify(value));
    db = api.require('db');
    value=value.replace(/\'/g, "\'\'");
    var sql = 'INSERT OR REPLACE INTO app (key,value) values (\'' + key + '\',\'' + value + '\')';
    db.executeSql({
        name: 'app',
        sql: sql
    }, function (ret, err) {
        if (callback) {
            callback(ret,err);
        }
        if(!ret.status){
            //alert(JSON.stringify(err));
        }
    });
}

/**
 * ret.status
 * ret.data
 * @param keys
 * @param callback
 */
function getItems(keys, callback) {
    var result = {};
    var j = 0;
    var hasCall = false;
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        (function (key) {
            getItem(key, function (ret) {
                if(ret.status){
                    result[key] = ret.data;
                }
                j++;
                if (j == keys.length && !hasCall) {
                    hasCall = true;
                    callback({status:true,data:result},{});
                }
            });
        })(key);
    }
}

/**
 * ret.status
 * ret.data
 * @param key
 * @param callback
 */
function getItem(key, callback) {
    var uid=''+getUserInfo().id;
    key=uid+key;
    db = api.require('db');
    var sql = 'select value from app where key=\'' + key + '\'';
    db.selectSql({
        name: 'app',
        sql: sql
    }, function (ret, err) {
        if (ret.status) {
            //alert("取消息"+JSON.stringify(ret))
            var data = ret.data;
            if(data.length>=1){
                callback({status:true,data:data[0].value}, err);
            }else{
                callback({status:true}, err);
            }
        } else {
            callback({status:false}, err);
        }

    });
}

/**
 * @param key
 * @param callback
 */
function removeItem(key, callback) {
    var uid=''+getUserInfo().id;
    key=uid+key;
    db = api.require('db');
    var sql = 'delete from app where key="' + key + '"';
    db.executeSql({
        name: 'app',
        sql: sql
    }, function (ret, err) {
        if(callback){
            callback(ret,err);
        }
    });
}



function kvListGet(key,callback){
    getItem(key,function(ret,err){
        var result=[];
        if(ret.status){
            var dbValue=ret.data;
            if(isNotBlack(dbValue)){
                result=JSON.parse(dbValue);
            }
            callback({status:true,data:result});
        }else{
            callback(ret,err);
        }
    });
}

//注意：如果是需要加锁的（防止getItem后在修改前，别的地方已经修改了）需要在外面自行加锁。
function kvListAdd(key, data,callback){
    kvListGet(key,function(ret,err){
        if(ret.status){
            var result=ret.data;
            result.push(data);
            setItem(key,JSON.stringify(result),function(ret,err){
                callback(ret,err);
            });
        }else{
            callback(ret,err);
        }
    });
}

function kvListRemove(key, data,callback){
    kvListGet(key,function(ret,err){
        if(ret.status){
            var result=ret.data;
            if(result.contains(data)) {
                result.remove(data);
                setItem(key, JSON.stringify(result), function (ret, err) {
                    callback(ret, err);
                });
            }else{
                callback(ret,err);
            }
        }else{
            callback(ret,err);
        }
    });
}


function kvMapGet(key,mapKey,callback){
    getItem(key,function(ret,err){
        var result={};
        if(ret.status){
            var dbValue=ret.data;
            if(isNotBlack(dbValue)){
                result=JSON.parse(dbValue);
            }
            callback({status:true,data:result[mapKey]});
        }else{
            callback(ret,err);
        }
    });
}

function kvMapPut(key,mapKey,mapValue,callback){
    getItem(key,function(ret,err){
        var result={};
        if(ret.status){
            var dbValue=ret.data;
            if(isNotBlack(dbValue)){
                result=JSON.parse(dbValue);
            }
            result[mapKey]=mapValue;
            setItem(key,JSON.stringify(result),function(ret,err){
                callback(ret,err);
            });
        }else{
            callback(ret,err);
        }
    });
}

function kvMapDelete(key,mapKey,callback){
    getItem(key,function(ret,err){
        var result={};
        if(ret.status){
            var dbValue=ret.data;
            if(isNotBlack(dbValue)){
                result=JSON.parse(dbValue);
            }
            if(isNotBlack(result[mapKey])){
                delete result[mapKey];
                setItem(key,JSON.stringify(result),function(ret,err){
                    callback(ret,err);
                });
            }else{
                callback(ret,err);
            }
        }else{
            callback(ret,err);
        }
    });
}

function kvMapListAdd(key,mapKey,mapListSubValue,callback){
    getItem(key,function(ret,err){
        var result={};
        if(ret.status){
            var dbValue=ret.data;
            if(isNotBlack(dbValue)){
                result=JSON.parse(dbValue);
            }
            if(isBlack(result[mapKey])){
                result[mapKey]=[];
            }
            result[mapKey].push(mapListSubValue);
            setItem(key,JSON.stringify(result),function(ret,err){
                callback(ret,err);
            });
        }else{
            callback(ret,err);
        }
    });
}

function kvMapListRemove(key,mapKey,mapListSubValue,callback){
    getItem(key,function(ret,err){
        var result={};
        if(ret.status){
            var dbValue=ret.data;
            if(isNotBlack(dbValue)){
                result=JSON.parse(dbValue);
            }
            if(isNotBlack(result[mapKey])&&result[mapKey].contains(mapListSubValue)){
                result[mapKey].remove(mapListSubValue);
                setItem(key,JSON.stringify(result),function(ret,err){
                    callback(ret,err);
                });
            }else{
                callback(ret,err);
            }

        }else{
            callback(ret,err);
        }
    });
}

