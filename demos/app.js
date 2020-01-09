const Koa = require('koa');
const koaStatic = require('koa-static');
const fs = require('fs');
const path = require('path');
const app = new Koa();

const mappings = {
    /* api path, http method, json file name */
    '/api/lottery': ['1.json', 'POST'],
    '/api/lottery/records': ['2.json', 'GET'],
    '/api/address/': ['3.json', 'GET']
};
app.use(koaStatic(path.resolve(__dirname, '..')));
app.use(async function (ctx) {
    let resInfo = mappings[ctx.href.replace(ctx.origin, '')] || mappings[ctx.path];
    ctx.response.set('Content-Type', 'application/json;charset=UTF-8');
    if (resInfo) {
        ctx.response.body = fs.readFileSync(path.resolve(__dirname, path.join('api-mock', resInfo[0])));
    } else {
        ctx.response.body = '{}';
    }
});

app.listen(3000);