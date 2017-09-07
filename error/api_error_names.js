/**
 * API错误名称
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
let ApiErrorNames = {};

ApiErrorNames.UNKNOW_ERROR = 'unknowError';
ApiErrorNames.USER_NOT_EXIST = 'userNotExist';
ApiErrorNames.USER_HAS_EXIST = 'userHasExist';
ApiErrorNames.USER_HAS_NOT = 'userHasNot';
ApiErrorNames.DENIAL_SERVICE = 'denialService';
ApiErrorNames.DENIAL_USER = 'denialUser';
ApiErrorNames.BACKEND_ERROR = 'backendError';

/**
 * API错误名称对应的错误信息
 */
const errorMap = new Map();

errorMap.set(ApiErrorNames.UNKNOW_ERROR, {code: 500, message: '未知错误'});
errorMap.set(ApiErrorNames.BACKEND_ERROR, {code: 502, message: '远程服务错误'});
errorMap.set(ApiErrorNames.USER_NOT_EXIST, {code: 101, message: '用户未登录'});
errorMap.set(ApiErrorNames.USER_HAS_EXIST, {code: 101, message: '用户未登录'});
errorMap.set(ApiErrorNames.USER_HAS_NOT, {code: 103, message: '用户不存在'});
errorMap.set(ApiErrorNames.DENIAL_USER, {code: 10105, message: '用户不存在或处于禁用状态'});
errorMap.set(ApiErrorNames.DENIAL_SERVICE, {code: 401, message: '没有权限执行此操作'});

//根据错误名称获取错误信息
ApiErrorNames.getErrorInfo = (errorName = ApiErrorNames.UNKNOW_ERROR) => {

    let errorInfo;
    errorInfo = errorMap.get(errorName);

    //如果没有对应的错误信息，默认'未知错误'
    if (!errorInfo) {
        errorName = ApiErrorNames.UNKNOW_ERROR;
        errorInfo = errorMap.get(errorName);
    }

    return errorInfo;
};

module.exports = ApiErrorNames;
module.exports.errorMap = errorMap;
