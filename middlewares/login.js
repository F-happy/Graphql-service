/**
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
const ApiError = require('../error/api_error');
const ApiErrorNames = require('../error/api_error_names');
const {decodeToken} = require('../utils/safety');

module.exports = async (ctx, next) => {
    //开始进入到下一个中间件
    await next();
    // if (process.env.NODE_ENV !== 'develop' && !'/v3/graphql_doc'.test(ctx.originalUrl)) {
    if (process.env.NODE_ENV === 'production') {
        if (!decodeToken(ctx.header.authorization)) {
            throw new ApiError(ApiErrorNames.USER_NOT_EXIST);
        }
    }
};
