"use strict";
var port,server,service,system = require('system');
var fs = require('fs');
var root = fs.absolute("./data");
fs.makeDirectory(root);
fs.changeWorkingDirectory(root);

console.log('workingDirectory'+root);


var page = require('webpage').create();
if(system.args.length !==2){
    console.log('Usage:serverkeeplive.js<portnumber>');
    phantom.exit(1);
} else {
    port = system.args[1];
    server = require('webserver').create();

    service = server.listen(port,function (request,response) {
        var requestUrl = request.post.url;
        response.headers = {
            'Cache':'no-cache',
            'Content-Type':'text/html;charset=utf-8'
        };
        if (requestUrl){
            page.open(requestUrl,function (status) {
                if (status!=='success'){
                    console.log('FAIL to load the address');
                    return;
                }
                var body = page.content;
                //写入文件
                fs.write('./demo.html',body,'w');
                response.write(body);
                response.close();
            });
        } else {
            var body = 'no spider url';
            response.write(body);
            response.close();
        }

    });

    if (service){
        console.log('Web server running on port'+port);
    } else {
        console.log('Error: Could not create web server listening on port'+port);
        phantom.exit();
    }
}

