
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
        dorac: any;
    }
}

interface Window {
    dorac: any;
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