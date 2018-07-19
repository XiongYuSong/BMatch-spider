"use strict";

var fs = require('fs');
var root = fs.absolute('./data/music');
fs.makeDirectory(root)
fs.changeWorkingDirectory(root);

console.log('workingDirectory:' + root);

var page = require('webpage').create();

var playListFileNames = [];

page.open("https://music.163.com/#/song?id=1293953023", function (status) {
    if (status !== 'success') {
        console.log('FAIL to load ' + page.url);
        return;
    }
    console.log('SUCCESS to load ' + page.url);
    eachSongId(0);
});

page.onError = function (message) {
    if (message.indexOf('__getURL__') !== -1) {
        var data = message.substring(10);
        var json = JSON.parse(data);
        var musicDataFile = root + '/' + json.id + '.json';
        fs.write(musicDataFile, data, 'w');
    }
};

/**
 * 循环监听歌单文件
 * @param time
 */
function eachSongId(time) {
    setTimeout(readPlayListFile, time);
    eachSongId(10000);
}

/**
 * 读取文件
 */
function readPlayListFile() {
    var dataPath = fs.absolute('./data');
    dataPath = 'D:/BMatch-spider/spider/data';
    if (!fs.exists(dataPath)) {
        return;
    }
    var playLists = fs.list(dataPath);
    for (var x = 0; x < playLists.length; x++) {
        var file = dataPath + '/' + playLists[x];
        if (playListFileNames.indexOf(file) !== -1 || !fs.isFile(file)) {
            continue;
        }
        var content = fs.read(file);
        var json = JSON.parse(content);
        var songIds = [];
        for (var i = 0; i < json.songs.length; i++) {
            var songId = json.songs[i].id;
            var musicDataFile = root + '/' + songId + '.json';
            if (!fs.exists(musicDataFile)) {
                songIds.push(songId);
            }
        }
        if (songIds.length > 0) {
            console.log(JSON.stringify(songIds));

            var evaJs = getUrl(songIds);
            page.evaluateAsync(evaJs);
            playListFileNames.push(file);
        }
    }
}

/**
 * 获取歌曲Url回调函数字符串
 */
function getUrl(ids) {
    var jsonIds = JSON.stringify(ids);
    var result = function () {
        var root = window.NEJ.P('nej.j');
        var server;
        for (var n in root){
            if (root[n].toString().indexOf('encText') !== -1) {
                server = root[n];
            }
        }
        server('/api/song/enhance/player/url',{
            type:'json',
            query:{
                ids:jsonIds,
                br:128000
            },
            onload:function (data) {
                for (var i = 0; i < data.data.length; i++){
                    var item = {
                        id:data.data[i].id,
                        url:data.data[i].url
                    };
                    console.error('__getURL__' + JSON.stringify(item))
                }
            }
        })
    };
    return result.toString().replace('jsonIds',jsonIds);
}
