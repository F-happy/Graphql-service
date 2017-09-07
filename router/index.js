/**
 * Created by fuhuixiang on 2017-6-26.
 */
"use strict";
const router = require('koa-router')();
const graphqlHTTP = require('koa-graphql');
const GraphQLSchema = require('./graphql');
const renderGraphiQL = require('../utils/render_graphiQL');

const graphqlModule = graphqlHTTP((request) => ({
    schema: GraphQLSchema,
    graphiql: false,
    context: {token: request.header.authorization, platform: request.query.v},
    formatError: error => ({
        type: 'graphql',
        path: error.path,
        message: error.message,
        locations: error.locations ? error.locations[0] : null
    })
}));

router.all('/', graphqlModule);

if (process.env.NODE_ENV !== 'production') {
    router.get('/graphql_doc', async (ctx, next) => {
        ctx.type = 'text/html';
        ctx.body = renderGraphiQL.renderGraphiQL({});
    });
    router.post('/graphql_doc', graphqlModule);
}

module.exports = router;
