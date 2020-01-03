/**
 * 组合多个mixin。
 * 
 * 例如：
 * class Cls implements MyMixin {
 *     // 需要定义MyMixin中引入的方法；否则，编译器报警告
 * }
 * 
 * applyMixins(Cls, [MyMixin]);
 * 
 * @param derivedCtor 需要被混入的类
 * 
 * @param baseCtors 混入的类
 */
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
