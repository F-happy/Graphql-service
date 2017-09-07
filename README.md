### 背景
今年我在做一个有关商户的app，这是一个包含商户从入网到审核、从驳回提交到入网维护的完整的生命周期线下推广人员使用的客户端软件，但故事并没有这么简单。。。

### 疑问

随着app的逐渐完善，遇到的问题也渐渐多了起来，界面加载过久，初始化页面请求次数过多等各种各样的小毛病开始凸显了出来。于是我开始了优化之路，第一步便是从api请求入手，仔细查看了每个api返回的内容，一直奇怪为什么接口总是返回很多的数据回来，比如我需要一个商户的详细信息，可接口却会把这个商户相关的门店信息、所有人信息等其它各种各样的信息一起返回回来，如果是例如商户详情页面也就罢了，可是在商户列表这个接口下依旧返回如此之多的数据，可想而知这个列表有多大多复杂了。

后来问过后端的同学才知道是为了兼容 web 端的需求，一个接口需要同时为多个平台提供内容，这大大增加了接口的返回内容和处理逻辑，而且需求也经常改动，所以还不如把能用到的字段全都输出出来，免得每次改需求都要前后端一起联动。

### 反思

得知了结果，这确实是一个有“充分”理由的处理结果，可是真的只能这样了嘛？有没有什么更好的解决办法呢？我们先来总结一下现在遇到的问题：

* 兼容多平台导致字段冗余
* 一个页面需要多次调用 API 聚合数据
* 需求经常改动导致接口很难为单一接口精简逻辑

以上三个问题看起来并不复杂，按照以往的逻辑其实也是很好解决的，就拿第一个来说，遇到多平台需要兼容时其实可以通过提供不同平台的接口来解决，例如这样：

```javaScript
http://api.xxx.com/web/getUserInfo/:uid
http://api.xxx.com/app/getUserInfo/:uid
http://api.xxx.com/mobile/getUserInfo/:uid
```
又或者是通过不同的参数去控制：
```javaScript
http://api.xxx.com/getUserInfo/:uid?platfrom=web
```
虽然这是一个方便的解决方案，但带来的其实是后端逻辑的增加，需要为不同平台维护不同的逻辑代码。

再说第二个问题，一个页面需要多次调用接口来聚合数据这块也可以通过多加接口的方式来解决：
```javaScript
http://api.xxx.com/getIndexInfo
```
或者是通过 http2 来复用请求，但这些方法不是增加工作量就是有兼容性问题，那么还有没有其他的方法呢？

如果大家还记得数据库的知识的话，就发现其实我们可以用 SQL 的思路去解决这些事情，那如果把后端抽象成一个数据库会怎么样呢？

我想要什么字段就 SELECT 什么字段就行咯，如果一个页面需要多个数据源的内容来填充那不就是组合 SQL 语句嘛。这样不就解决了上面提出的三个问题了嘛，而且无论前端需求如何变更，只要我们维持一个数据的超集，那么每次只要让前端改动查询语句就可以了，后端这里也不需要同步的去给某个接口增加字段什么的了，那么解决方案有了，那该怎么把后端抽象成一个数据库呢？

### 解决

既然思路有了，那么办法也会有的~这就是 Facebook 在2015年开源的 [GraphQL](http://graphql.org)

这又是一个什么东西呢？具体的介绍直接看它的官网就好了，我在这里就不多说了，直接来看看如何使用吧。

由于我的中间层是基于 [Koa2](http://koajs.com) 的，所以就在 koa2 上面做演示了，手写我们先安装依赖：
```javaScript
npm install graphql koa-graphql --save
```
这样我们就可以在 koa 中使用 graphql 了，然后就是配置路由了，按照文档上面的例子，我们可以这样写：
```javaScript
"use strict";
const router = require('koa-router')();
const graphqlHTTP = require('koa-graphql');
const GraphQLSchema = require('./graphql');
const renderGraphiQL = require('../utils/render_graphiQL');
const graphqlModule = graphqlHTTP((request) => ({
    schema: GraphQLSchema,
    graphiql: false,
    context: {token: request.header.authorization, platform: request.query.platform},
    formatError: error => ({
        type: 'graphql',
        path: error.path,
        message: error.message,
        locations: error.locations ? error.locations[0] : null
    })
}));
router.all('/graphql', graphqlModule);
```
我们来看看 graphqlModule 对象中都包含写什么吧，首先是 schema，这个是我们主要的解析逻辑，所有通过 graphql 的请求都会被传入这里进行解析和处理，graphiql 这个是 koa-graphql 自带的一个图形界面版的测试地址，后面我再单独介绍这个插件，context 是我们的上下文，如果我们需要在每个解析函数内获取到例如用户 token时就可以在这里赋值，需求说明的是这个必须是一个 object 对象，并且如果我们不指定的话会默认传整个 request 对象，接下来就是最后一个常用的属性了，formatError 是格式化错误的属性，我们可以根据业务的需求自定义我们的错误返回。

接下来去看看从最简单的 hello world 开始，然后完成一个最基础的 demo。

首先我们在客户端发起一个 post 请求，然后在请求 body 中带上我们的查询语句，在 Graphql 中有两种类型的查询，一直是 query 开头的查询操作，一种是 mutation 开头的修改操作。
```javaScript
query {hello}
```
这是一个最简单的查询，那么这个查询是如何通过解析的呢？上文说到全部的 Graphql 查询都会通过 schema 来进行解析，那我们看看上面定义的GraphQLSchema对象是个什么吧。
```javaScript
module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'rootQueryType',
        description: '查询操作',
        fields: {
            hello: {
                type: GraphQLString,
                description: '演示 demo',
                args: {
                    name: {type: GraphQLString, description: '演示参数'}
                },
                resolve(it, args, context) {
                    return args.name;
                }
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'rootMutationType',
        description: '新增或修改操作',
        fields: {}
    })
});
```
我们一步步来说，首先在这个文件中导出的是一个 GraphQLSchema 对象，这是 Graphql 的基础对象，里面包含了我们需要的两种类型，然后看 query 属性，它返回的是一个GraphQLObjectType对象，这是 Graphql 中对于 object 的基本类型，这个对象中包含 name:名称（全局唯一），description: 描述（这会自动的显示在文档中，虽然是非必须的，但是我还是强烈建议每个 Graphql 节点都写上，这样在后面的维护和查询中都非常有利），最后就是fields属性了，一个 Graphql 语句能查到什么就全靠这里写了什么了，在开始的例句中我们查询 query{hello}，其实就是说我们要查根节点下的 hello 属性，所以这里我们就需要在 query 的 fields 中写上 hello 属性了，否则这条查询语句就无法生效了。

接下来我们看看这个 hello 属性中又包含了什么呢？首先我们需要指定它的类型，这很关键，这个类型是 hello 的返回类型，在这里我指定它返回的是一个字符串，除此之外还有 Int，Boolean 等 js 的基础类型可供选择，具体可去查看文档，当然了，在复杂情况下也可以返回 GraphQLObjectType 这种对象类型，然后就是对 hello 的描述字段description，接下来是args 属性，如果我们需要给这次查询传入参数的话就靠这个了，接下来就是最关键的 resolve 函数了，这个函数接受三个参数，第一个是上层的返回值，这在循环嵌套的情况下会经常使用，比如说如果 hello 还有子属性的话，那么子属性的这个参数就会是 args.name，第二个参数便是查询属性，第三个是我们一开始说的贯穿整个请求的上下文。下面是一个完整的例子:
```javaScript
Request: query{hello(name: "world")}

Response: {"hello": "world"}
```

讲完了 query 操作，其实 mutation 操作也是类似的，我就不再展开说了。

### 总结

最后来总结一下这个解决方案吧，其实这个方案你说是不是最佳解呢？也未必，还是要看具体的业务场景的，在我遇到的场景中各种数据的关系是明确的，或者说是可以抽象成模型的，我认为这是能否使用 Graphql 的关键，从上面的实例中我们其实可以发现通过 Graphql 我们把每个数据都规范了起来，指定了类型，确定了嵌套关系，这在以 JavaScript 为基础的 node 环境中显得那么格格不入，本身 JavaScript 是弱类型的，基于此我们可以在 node 服务中灵活的修改数据，从而不需要关心返回值和参数值，但是 Graphql 用一种强类型的观念来强制我们设计每个数据，也许会有些前端的同学接受不了，但是我个人认为这种思路其实是非常合理的，并且 Graphql 这种还支持嵌套查询，只需要 fields 属性中有这个对象就行了，因此我们可以把每个数据类型尽可能的抽象和分离出来，举个例子，店长这个角色不就是用户对象加上商户对象的组合嘛，这不仅从关系上明确了逻辑，也方便了更多可能性的组合条件。

对应我一开始遇到的那几个问题，Graphql 看上去似乎完美的解决了我的问题，但是对于更加复杂的场景呢？或者说对于老项目的改造成本是否划算呢？虽然我没有遇到，但是我觉得只要认真梳理数据结构，最终都可以的，但那个时候是否还需要 Graphql 呢？那就不知道了，这篇博客不是介绍 Graphql 如何使用的中文文档，我想表达的是这种思路对于这种场景下的一个解决思路，现在它只是解决了我的这些问题，那么从这个思路的身上能不能挖掘出更多的惊喜呢？它还是太新了，也许过几年回头再看，它说不定就和 restful 一样是 API 的标配了也说不定呢，毕竟 GitHub 今年也推出了他们的 Graphql API 了呢。

