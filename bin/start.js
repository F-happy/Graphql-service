#!/usr/bin/env node

"use strict";
const fs = require('fs');
const logConfig = require('../config/log_config');
const server = require('../index');

/**
 * 确定目录是否存在，如果不存在则创建目录
 */
function confirmPath(pathStr) {
    if (!fs.existsSync(pathStr)) {
        fs.mkdirSync(pathStr);
        console.log('createPath: ' + pathStr);
    }
}

/**
 * 初始化log相关目录
 */
function initLogPath() {
    //创建log的根目录'logs'
    if (logConfig.baseLogPath) {
        confirmPath(logConfig.baseLogPath);
        //根据不同的logType创建不同的文件目录
        for (let i = 0, len = logConfig.appenders.length; i < len; i++) {
            if (logConfig.appenders[i].path) {
                confirmPath(logConfig.baseLogPath + logConfig.appenders[i].path);
            }
        }
    }
}

if (process.env.NODE_ENV !== 'develop') {
    initLogPath();
}

server.listen(process.env.PORT || 2333);
console.log(`[server] 服务器已启动！端口: ${process.env.PORT || 2333}`);
