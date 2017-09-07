/**
 * 自定义Api异常
 * Created by fuhuixiang on 2017-7-24.
 */
const ApiErrorNames = require('./api_error_names');

class ApiError extends Error {

    //构造方法
    constructor(errorName, errorMessage, errorCode) {
        super();
        if (errorName === 'rpcError' || errorName === 'apiError') {
            this.name = errorName;
            this.code = 500;
            this.message = errorMessage || '接口404';
        } else {
            let errorInfo = ApiErrorNames.getErrorInfo(errorName);
            this.name = errorName;
            this.code = errorInfo.code;
            this.message = errorInfo.message;
        }
    }
}

module.exports = ApiError;
