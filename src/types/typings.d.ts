
declare module '*.html' {
    const content: string;
    export default content;
}
declare module '*.scss' {
    const content: { [className: string]: string };
    export = content;
}

declare module '*.png' {
    const value: any;
    export default value;
}

declare module NodeJS {
    interface Global {
        $: any;
        jQuery: any;
        hjc: any;
    }
}

interface Window {
    hjc: any;
    debug: (desc: string) => void;
    lottery: any;
    share: StandaloneUtility;
    /**
     * 操作剪切板
     * 
     */
    ClipboardJS?: (selector: string|Element) => void;
    /**
     * 微信分享
     * 
     */
    wxshare?: any;
    /**
     * 沪江app内web容器注入的全局对象
     * 
     */
    HJApp?: any;
    /**
     * 沪江app内web容器上的原生导航栏分享按钮点击时间
     * 
     */
    appshare: () => void;
    /**
     * hj-jssdk注入的对象
     * 
     */
    HJSDK: any;
    /**
     * 部分国产浏览器会注入全局对象
     * 
     */
    browser: any;
    qb: any;
    ucweb: any;
    ucbrowser: any;

    server_data: ServerDataModel;
}

interface NodeModule {
    hot: any;
}