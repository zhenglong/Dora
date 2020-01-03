import webpack from 'webpack';

import global from '../../internal/singleton';

const placeholders = {
    'mainVersion': (path: string, data: any): string => {
        // 拿到entry名称，然后找到对应的主版本号
        let chunk = data.chunk;
        if (!chunk) {
            return path;
        }
        let chunkName = chunk.name;
        let mainVerionNo = global.instance().versionMapping[chunkName];
        if (mainVerionNo) {
            return path.replace(/\[mainVersion\]/g, mainVerionNo);
        }
        return path;
    }
};

/**
 * 可以在文件名中使用[mainVersion]占位符，指定发布包的主版本号。
 * 
 * 
 */
export default class PlaceholderInjectorPlugin {
    apply(compiler: webpack.Compiler) {
        compiler.hooks.compilation.tap('PlaceholderInjectorPlugin', compilation => {
            const mainTemplate: any = compilation.mainTemplate;
            mainTemplate.hooks.assetPath.tap('PlaceholderInjectorPlugin', (path: string, data: any) => {
                for (let key in placeholders) {
                    if (!placeholders.hasOwnProperty(key)) {
                        continue;
                    }
                    path = placeholders[key](path, data);
                }
                return path;
            });
        });
    }
}