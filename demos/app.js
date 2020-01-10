const Koa = require('koa');
const koaStatic = require('koa-static');
const fs = require('fs');
const path = require('path');
const app = new Koa();

const mappings = {
    /* api path, http method, json file name */
    '/api/lottery': ['1.json', 'POST'],
    '/api/lottery/records': ['2.json', 'GET'],
    '/api/address': ['3.json', 'GET']
};

var cities = null;
var counties = null;

app.use(koaStatic(path.resolve(__dirname, '..')));
app.use(async function (ctx) {
    let resInfo = mappings[ctx.href.replace(ctx.origin, '')] || mappings[ctx.path];
    ctx.response.set('Content-Type', 'application/json;charset=UTF-8');
    if (resInfo) {
        var areaId = ctx.query.id;
        if (areaId == '0') {
            areaId = '';
        }
        if (areaId) {
            if (!cities) {
                cities = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.join('api-mock', '4.json'))));
            }
            var areas = cities[ctx.query.id];
            if (!areas) {
                if (!counties) {
                    counties = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.join('api-mock', '5.json'))));
                }
                areas = counties[ctx.query.id];
            }
            ctx.response.body = JSON.stringify({
                data: areas || {}, 
                status: 0
            });
        } else {
            ctx.response.body = fs.readFileSync(path.resolve(__dirname, path.join('api-mock', resInfo[0])));
        }
    } else {
        ctx.response.body = '{}';
    }
});

app.listen(3000);