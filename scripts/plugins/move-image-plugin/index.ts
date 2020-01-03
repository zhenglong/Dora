import webpack from 'webpack';
import path from 'path';

/**
 * 修改assets，保证图片输出到widget/lib发布目录之下
 * 
 */
export default class MoveImagePlugin {
    apply(compiler: webpack.Compiler) {
        compiler.hooks.compilation.tap("MoveImagePlugin", compilation => {
            compilation.hooks.beforeModuleAssets.tap('MoveImagePluginBeforeModuleAssets', () => {
                for (let module of compilation.modules) {
                    // 对于css模块，处理其assets的路径
                    // 通过文件后缀名区分
                    if (!/\.(le|s[ca]|c)ss$/i.test(module.resource)) {
                        continue;
                    }
                    if (module.buildInfo.assets) {
                        let keys = Object.keys(module.buildInfo.assets);
                        for (const assetName of keys) {
                            let splittings = module.context.split(path.sep);
                            let lastDir = splittings[splittings.length - 1];
                            let newAssetName = path.join(lastDir, assetName);
                            module.buildInfo.assets[newAssetName] = module.buildInfo.assets[assetName];
                            module.buildInfo.assets[assetName] = null;
                            delete module.buildInfo.assets[assetName];
                        }
                    }
                }
            });
        });
    }
}