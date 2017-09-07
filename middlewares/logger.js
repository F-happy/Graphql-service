/**
 * log工具
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
const logUtil = require('../utils/log_util');
const {errorMap} = require('../error/api_error_names');

module.exports = async (ctx, next) => {
    //响应开始时间
    const start = new Date();
    //响应间隔时间
    let ms;
    try {
        //开始进入到下一个中间件
        await next();
        if (process.env.NODE_ENV !== 'develop') {
            //记录响应日志
            ms = new Date() - start;
            if (process.env.NODE_ENV !== 'develop') {
                logUtil.logResponse(ctx, ms);
            }
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'develop') {
            console.log(error);
        } else if (process.env.NODE_ENV === 'test') {
            //记录异常日志
            ms = new Date() - start;
            logUtil.logError(ctx, error, ms);
        } else if (process.env.NODE_ENV === 'production' && !errorMap.has(error.name)) {
            //记录异常日志
            ms = new Date() - start;
            logUtil.logError(ctx, error, ms);
        }
    }
};
