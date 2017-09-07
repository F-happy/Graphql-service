/**
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
const path = require('path');

//日志根目录
const baseLogPath = path.resolve(__dirname, '../logs');

//错误日志输出完整路径
const errorLogPath = `${baseLogPath}/error/error`;

//响应日志输出完整路径
const responseLogPath = `${baseLogPath}/response/response`;

//RPC日志输出完整路径
const rpcLogPath = `${baseLogPath}/rpc/rpc`;

module.exports = {
    appenders: {
        errorLogger: {
            type: 'dateFile',
            filename: errorLogPath,
            pattern: '-yyyy-MM-dd-hh.log',
            alwaysIncludePattern: true
        },
        resLogger: {
            type: 'dateFile',
            filename: responseLogPath,
            pattern: '-yyyy-MM-dd-hh.log',
            alwaysIncludePattern: true
        },
        rpcLogger: {
            type: 'dateFile',
            filename: rpcLogPath,
            pattern: '-yyyy-MM-dd-hh.log',
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: {appenders: ['resLogger'], level: 'ALL'},
        resLogger: {appenders: ['resLogger'], level: 'ALL'},
        rpcLogger: {appenders: ['rpcLogger'], level: 'ALL'},
        errorLogger: {appenders: ['errorLogger'], level: 'ERROR'}
    },
    pm2: true,
    baseLogPath: baseLogPath
};
