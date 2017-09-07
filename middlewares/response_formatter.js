/**
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
const logUtil = require('../utils/log_util');
const ApiError = require('../error/api_error');
const {errorMap} = require('../error/api_error_names');

function responseFormatter(ctx) {
    //如果有返回数据，将返回数据添加到data中
    try {
        const {errors, data} = JSON.parse(ctx.body);
        if (errors) {
            if (process.env.NODE_ENV !== 'production') {
                console.log(errors);
            }
            let error = {code: 500, message: '内部服务错误'};
            if (errorMap.get(errors[0].message)) {
                error = errorMap.get(errors[0].message);
            } else if (errors[0].type === 'graphql') {
                // error = {code: 500, message: 'GraphQL内部错误'};
                error = {code: 500, message: errors[0].message};
            }
            logUtil.logError(ctx, error);
            ctx.body = error;
        } else {
            ctx.body = {
                code: 200,
                message: 'success',
                data: data
            }
        }
    } catch (err) {
        // console.log(err);
    }
}

function urlFilter(pattern) {
    return async (ctx, next) => {
        let reg = new RegExp(pattern);
        try {
            //先去执行路由
            await next();
        } catch (error) {
            //如果异常类型是API异常并且通过正则验证的url，将错误信息添加到响应体中返回。
            if (error instanceof ApiError && reg.test(ctx.originalUrl)) {
                ctx.status = 200;
                ctx.body = {
                    code: error.code,
                    message: error.message
                }
            }
            //继续抛，让外层中间件处理日志
            throw error;
        }

        //通过正则的url进行格式化处理
        if (reg.test(ctx.originalUrl)) {
            responseFormatter(ctx);
        }
    }
}

module.exports = urlFilter;
