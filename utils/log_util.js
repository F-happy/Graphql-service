/**
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
const log4js = require('log4js');
const logConfig = require('../config/log_config');

//加载配置文件
log4js.configure(logConfig);

let logUtil = {};

let errorLogger = log4js.getLogger('errorLogger');
let resLogger = log4js.getLogger('resLogger');
let rpcLogger = log4js.getLogger('rpcLogger');

//封装错误日志
logUtil.logError = (ctx, error, resTime) => {
    if (ctx && error) {
        errorLogger.error(formatError(ctx, error, resTime));
    }
};

//封装响应日志
logUtil.logResponse = (ctx, resTime) => {
    if (ctx) {
        resLogger.info(formatRes(ctx, resTime));
    }
};

//封装RPC响应日志
logUtil.logRPCResponse = (ctx) => {
    if (ctx) {
        rpcLogger.info(formatRPCRes(ctx, Date.now()));
    }
};

//格式化RPC响应日志
const formatRPCRes = (ctx, resTime) => {
    return `header: ${ctx} time: ${resTime}`;
};

//格式化响应日志
const formatRes = (ctx, resTime) => {
    let logText = '';

    //添加请求日志
    logText += formatReqLog(ctx.request, resTime);

    //响应状态码
    logText += `status: ${ctx.status} `;

    //响应内容
    logText += `body: ${JSON.stringify(ctx.body)} `;

    return logText;
};

//格式化错误日志
const formatError = (ctx, err, resTime) => {
    let logText = '';

    //添加请求日志
    logText += formatReqLog(ctx.request, resTime);

    if (process.env.NODE_ENV === 'test') {
        console.log(err);
        //错误名称
        logText += "err type: " + err.type + "\n";
    }

    //错误信息
    logText += "err message: " + err.message + "\n";

    return logText;
};

//格式化请求日志
const formatReqLog = (req, resTime) => {

    let logText = '';

    let method = req.method;
    //访问方法
    logText += `method: ${method} `;

    //请求原始地址
    // logText += "request originalUrl:  " + req.originalUrl + "\n";

    //客户端ip
    // logText += "request client ip:  " + req.ip + "\n";

    //请求参数
    if (method === 'GET') {
        logText += `query: ${JSON.stringify(req.query).replace(/\s+/g, '')} `;
    } else {
        logText += `body: ${JSON.stringify(req.body).replace(/\s+/g, '')} `;
    }
    //服务器响应时间
    logText += `time: ${resTime} `;

    return logText;
};

module.exports = logUtil;
