import fs from 'fs';
import path from 'path';
import webpack, { Entry } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import {spawn} from 'child_process';

import PlaceholderInjectorPlugin from './plugins/placeholder-injector-plugin';
import MoveImagePlugin from './plugins/move-image-plugin';

import { ENV_PACKAGE_NAME } from './internal/env-def';

const projectRoot = path.resolve(__dirname, '../');
const isDevMode = process.env.NODE_ENV == 'development';
const port = 8080;
const domainName = 'local.domain.com';

import global from './internal/singleton';

function initVersionMap() {
    let packageNames = process.env.argv || '';
    let splittings = packageNames.split(',');

    let { versionMapping } = global.instance();

    for (let i = 0; i < splittings.length; i++) {
        let [packageName, mainVersion] = splittings[i].split('@');
        versionMapping[packageName] = mainVersion;
    }
}

function getPackagePath(name: string): Entry {
    let names = name.split(',');
    let dirNames = ['widgets', 'libs'];
    let res = {};
    for (let packageName of names) {
        for (let dirName of dirNames) {
            let dir = path.join(projectRoot, 'src', dirName, packageName);
            if (fs.existsSync(dir)) {
                res[packageName] = dir;
                break;
            }
        }
    }
    return res;
}

let options: webpack.Configuration = {
    context: projectRoot,
    module: {
        rules: [{
            test: /\.(png|jpg|gif)$/i,
            loader: 'url-loader',
            options: {
                name: '[path][name].[ext]',
                limit: 2048,
                outputPath(url: string, resourcePath: string, context: string) {
                    // 保证css中图片引用地址正确
                    url = url.replace(/^src\/(widgets|libs)\/[a-zA-Z\d-_]+\//, './');
                    return url;
                }
            }
        }, {
            test: /\.ts(x?)$/,
            loader: 'ts-loader'
        }, {
            test: /\.html$/,
            loader: 'html-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.scss', '.css', '.html'],
        modules: [path.resolve(projectRoot, './node_modules'), path.resolve(projectRoot, './src/scss')]
    },
    externals: {
        'mustache': 'Mustache',
        '$': '$',
        'react': 'React',
        'react-dom': 'ReactDOM',
        'redux': 'Redux',
        'react-redux': 'ReactRedux'
    }
};

initVersionMap();

if (!isDevMode) {
    options.entry = getPackagePath(process.env[ENV_PACKAGE_NAME]);
    options.mode = 'production';
    options.output = {
        filename: '[name]/v[mainVersion].[hash:8].js',
        libraryTarget: 'umd'
    };
    options.module.rules.push({
        test: /\.(sa|sc|c)ss$/,
        use: [
            MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
                options: {
                    modules: true,
                    localIdentName: '[hash:8]'
                }
            },
            'postcss-loader',
            'sass-loader'
        ]
    });
    options.plugins = [
        new MiniCssExtractPlugin({
            filename: '[name]/v[mainVersion].[hash:8].css',
            chunkFileName: '[id].[hash:8].css'
        }),
        new PlaceholderInjectorPlugin(),
        new MoveImagePlugin()
    ];
} else {
    options.entry = {
        entry: ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=10000&reload=true',
            path.resolve(projectRoot, './demos/entry.tsx')]
    };
    options.mode = 'development';
    options.output = {
        filename: `[name]/bundle.js`,
            publicPath: `http://${domainName}:${port}/`
    };
    options.module.rules.push({
        test: /\.(sa|sc|c)ss$/,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    modules: true,
                    localIdentName: '[hash:8]'
                }
            },
            'postcss-loader',
            'sass-loader'
        ]
    });
    options.plugins = [new MiniCssExtractPlugin({
        filename: '[name].css',
        chunFileName: '[id].css'
    }), new webpack.HotModuleReplacementPlugin()];
}

const webpackInstance = webpack(options);

if (isDevMode) {
    console.log(`node ${path.join(projectRoot, 'demos', 'app.js')}`);
    spawn('node', [path.join(projectRoot, 'demos', 'app.js')]);
    let server = new WebpackDevServer(webpackInstance, {
        hot: true,
        compress: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                secure: false,
                changeOrigin: true
            }
        },
        after: (app) => {
            app.use(WebpackHotMiddleware(webpackInstance));
        }
    });
    server.listen(port, domainName, () => {
        console.log('listening');
    });
    
} else {
    webpackInstance.run((err, stats) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log('compilation successful');
    });
}
