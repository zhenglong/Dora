目标：

1. widget一般不再内嵌widget

2. template可以引用widget或template

---

## 怎么在template中使用widget？

``` html
    <div>
        <div dora-widget1>
            <div slot="" dora-widget2></div>
        </div>
        <div dora-widget3></div>
    </div>
```
``` javascript
// 初始化状态
new Template({
    runtime: react | vue | '',
    initState: {
        'widget1': {
        },
        'widget1.widget2': {
        }
    } || () => obj
});
```
``` javascript
// 如何解析
let depends = [];
loop depends:
// fetch的时候如果发现对应资源已加载，则不用再次发起请求
    fetch([resources]).then(widget => {
        widget.mount();
        generateState();
        render();
    })
```
如果需要把widget打包到template中，也需要支持

## widget设计规范

**数据管理规范**

内部数据状态 

    local store 单向数据流 依赖redux

接口规约

    1. 数据源，为普通对象，不支持嵌套对象

    2. 渲染模板

    3. 指定渲染方式，可选值 react|vue|''

``` typescript
interface Widget {
    /**
     * 负责widget数据采集：加载时间，执行时间
     * 
     */
    public mount() : void;
    /**
     * 负责widget的清理工作，后期会支持widget的卸载和再次加载
     * 
     */
    public unmount() : void;
    /**
     * 返回widget预计的占位区域
     * 
     */
    public get preferredSize() : size;
    /**
     * widget加载中时，显示的界面
     * 
     */
    public loadingPlaceholder() : string;
    /**
     * widget加载出错时，显示的界面
     * 
     */
    public errorPlaceholder() : string;
    /**
     * widget模板函数
     * 
     */
    public tpl() : string;
    /**
     * widget数据源
     * 
     */
    public dataSource() : object;

    public versionNumber() : string;
}
```

怎么支持async：

    对多种代码拆分api的兼容：import，System.import，require.ensure

纯js单元通过data-\*生效，例如图片懒加载

css影响范围限定在widget内：

采用[css modules规范](https://github.com/css-modules/css-modules)，在需要访问css类的地方使用 **styles** 变量获取。例如，

``` typescript

// react版
class DemoWidget implements Widget {
    render() {
        let {styles} = this.state;
        return (
            <div className={styles['container']}></div>
        );
    }
}
// vue版
Vue.component('demo-widget', {
    template: `<div :class="[styles['container']]"></div>`
});

```

**注意，styles变成了保留属性名，所以在定义状态时避免命名冲突。**


需要做的事情：

 1. 把数据源转化成 状态 + 操作函数

 2. 在tpl以及事件处理函数中能够访问到状态以及操作函数

 3. 往state中注入styles变量，用于访问样式信息

widget单独版本升级与发布

构建widget时指定版本号，每个widget下保存每个widget的发布记录CHANGELOG.md，每次发布更新需要记录4种信息：版本号，日期，主修改人和发布描述

``` bash
npm run build --widgets widget1@version-number,widget2@version-number
```

## 质量保证：

typescript 

test

## 修正

基于react+redux

widget默认情况下会独立管理自己的store，也可以把store托管给应用进行全局管理。

## 未来计划

widget之间怎么做数据通信

服务端渲染 / 客户端渲染随服务器压力自动切换

更好支持静态资源本地缓存

fetch

加快构建速度