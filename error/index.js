/**
 * 自定义Api异常
 * Created by fuhuixiang on 2017-7-24.
 */
const ApiErrorNames = require('./api_error_names');
const ApiError = require('./api_error');

module.exports = {
    ApiError: ApiError,
    ErrorMap: ApiErrorNames.errorMap,
    ApiErrorNames: ApiErrorNames
};
