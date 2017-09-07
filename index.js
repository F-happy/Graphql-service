/**
 * Created by fuhuixiang on 2017-6-24.
 */
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('kcors');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

const api = require('./router/index');
const responseFormatter = require('./middlewares/response_formatter');
const logMiddleware = require('./middlewares/logger');
const loginMiddleware = require('./middlewares/login');

const router = new Router();

app.use(cors());

// https://github.com/koajs/bodyparser/blob/master/index.js#L33
// https://github.com/koajs/bodyparser/blob/master/index.js#L70
app.use(bodyParser({
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
        text: ['application/graphql']
    }
}));

app.use(logMiddleware);

//添加格式化处理响应结果的中间件，在添加路由之前调用
app.use(responseFormatter('^/v3'));

router.use('/v3', api.routes(), api.allowedMethods());

app.use(loginMiddleware);

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods());

app.jsonSpaces = 0;

// response
app.on('error', (err, ctx) => {
    console.log(err);
    // logger.error('server error', err, ctx);
});

module.exports = app;
