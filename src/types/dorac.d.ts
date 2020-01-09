
// 因为全局类型定义文件不能引用非全局接口定义
// 所以，这个地方定义一个占位接口
declare interface ReactNode{}
interface AlertButtonInfo {
    text: string;
    href?: string;
    click?: () => void;
}

interface AlertOptions {
    title?: string;
    /**
     * 允许值：
     * 1. html string；
     * 2. jsx模板
     * 3. 如果不指定body字段，可以嵌套子组件，一般在编写模板时使用。例如：
     * <Alert>
     *     <Widget />
     * </Alert>
     * 
     */
    body?: string | ReactNode;
    buttons?: AlertButtonInfo[];
    onClosed?: () => void;
}

interface LoadingOptions {
    msg?: string;
}

interface DoracInterface {
    ismc: boolean;
    isandroid: boolean;
    isios: boolean;
    alert: (opts: AlertOptions) => void;
    hideAlert: () => void;
    loading: (msg?: string)=> void;
    hideLoading: () => void;
    /**
     * 
     * @param {number} duration - 默认值2000，单位：毫秒
     * 
     */
    showToast: (msg: string, duration?: number) => void;
}
interface ServerDataModel {
    topicid: number;
    share_title: string;
    share_desc: string;
    share_url: string;
    share_img: string;
}

interface StandaloneUtility {
    act: () => void;
}

interface LotteryOptions {
    /**
     * 抽奖栏位所在专题，默认为当前专题
     * 
     */
    TopicID?: number;
    /**
     * 抽奖栏位ID
     * 
     */
    AreaID: number;
    /**
     * 抽奖动画时间
     * 
     */
    animate_time?: number;

    /**
     * 实物地址填写表单模板
     * 
     */
    inputFormAlertTemplate: any;

    /**
     * 抽奖成功/失败的弹框模板
     * 
     */
    resultAlertTemplate: any;
}

declare var dorac: DoracInterface;

declare var server_data: ServerDataModel;

declare var lottery: (options: LotteryOptions) => void;