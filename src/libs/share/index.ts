import lazyLoadScript from '../../mixins/lazy-load-script';
import FallbackShareTemplate, { FallbackShareTemplatePropsData } from './components/fallback-share';
import ClipboardFormTemplate, { ClipboardFormTemplatePropsData } from './components/clipboard-form';
import WidgetRunner, { WidgetRunnerResult } from '../../mixins/widget-runner';

const ua = navigator.userAgent.toLowerCase();

const isweixin = (ua.indexOf('micromessenger') > -1);

const config = {
    isapp: ua.indexOf('hjapp') > -1,
    isqq: ua.indexOf('qqbrowser') > -1,
    isuc: ua.indexOf('ucbrowser') > -1
};

const ShareType = {
    friend: 'friend',
    circle: 'circle',
    qq: 'qq',
    qzone: 'qzone',
    sina: 'sina'
};

const targets = {
    'qq': 'QQ好友',
    'qzone': 'QQ空间',
    'sinaweibo': '新浪微博',
    'wxfriends': '微信好友',
    'wxcircle': '朋友圈'
};

interface ShareInfo {
    title: string;
    description: string;
    imgUrl: string;
    link: string;
}

const utilityNotReadyMsg = '分享组件正在初始化中，请稍候';
const hjsdkUrl = 'https://res.hjfile.cn/co/sdk/0.3.0/hjsdk.min.js';
const hjweixinUrl = 'https://common.hjfile.cn/js/hj-weixin-2.0.js';

/**
 * 负责把环境检测以及对应静态资源加载好
 * 沪江app
 * qq浏览器
 * uc浏览器
 * 微信
 * 
 * 对不同环境实现好onDoShare
 * 
 * 判断唤起fallback-share-template、clipboard-form-template的条件
 * 
 */
export default class McShare implements StandaloneUtility {

    shareInfo: ShareInfo;
    afterShareCallback: (platform: string, target: string) => void;
    isInitScriptLoading: boolean = false;
    fallbackShareWidgetRunnerResult: WidgetRunnerResult<FallbackShareTemplate>;

    /**
     * 分享方法定义
     *
     * @param {string} tp - 分享渠道
     * @returns {boolean} - 如果当前版本qq浏览器支持的话，返回true；否则，返回false
     *
     */
    onDoShare: (tp: string) => boolean;

    shareWays = [
        [ShareType.friend, '微信好友'],
        [ShareType.circle, '朋友圈'],
        [ShareType.qq, 'QQ好友'],
        [ShareType.qzone, 'QQ空间'],
        [ShareType.sina, '新浪微博']
    ];

    constructor(props?: ShareInfo) {
        if (!props && window.server_data) {
            props = {
                title: server_data.share_title,
                description: server_data.share_desc,
                imgUrl: server_data.share_img,
                link: server_data.share_url
            };
        } else {
            props = {
                title: '',
                description: '',
                imgUrl: '',
                link: ''
            };
        }
        if (!props.link) {
            props.link = window.location.href;
        }
        this.shareInfo = props;

        this.onShareItemClick = this.onShareItemClick.bind(this);
        this.reset = this.reset.bind(this);
        this.initWxShare = this.initWxShare.bind(this);
        this.loadIfNot = this.loadIfNot.bind(this);
        this.getLink = this.getLink.bind(this);

        this.qqBrowserShare = this.qqBrowserShare.bind(this);
        this.ucBrowserShare = this.ucBrowserShare.bind(this);
        this.appShare = this.appShare.bind(this);
    }

    act(): void {
        if (this.isInitScriptLoading) {
            hjc.showToast(utilityNotReadyMsg);
            return;
        }
        this.isInitScriptLoading = true;
        if (config.isapp && window.HJApp) {
            // 如果是沪江app，且支持hjapp对象，直接弹出分享面板-
            this.loadIfNot(hjsdkUrl, () => {
                this.appShare();
            });
        } else {
            if (isweixin) {
                this.fallbackShareWidgetRunnerResult = 
                    WidgetRunner<FallbackShareTemplatePropsData, FallbackShareTemplate>(
                    FallbackShareTemplate, {
                        isweixin,
                        onCompleted: () => {
                            this.fallbackShareWidgetRunnerResult.destroy();
                        }
                    }
                );
                this.initWxShare();
            } else {
                // 分享渠道弹框 -> 如果不能唤起原生分享面板，则显示：非app环境
                this.fallbackShare();
                if (config.isqq || config.isuc) {
                    if (config.isuc) {
                        this.onDoShare = this.ucBrowserShare;
                    } else if (config.isqq) {
                        this.onDoShare = this.qqBrowserShare;
                    }
                    this.ucQqInit();
                } else {
                    this.isInitScriptLoading = false;
                }
            }
        }
    }

    onShareItemClick(e: React.MouseEvent): void {
        let shareType = $(e.currentTarget).data('type');
        if (this.isInitScriptLoading) {
            hjc.showToast('分享插件正在初始化中，请稍后重试');
            return;
        }

        if (!this.onDoShare || !this.onDoShare(shareType)) {
            FallbackShareTemplate.unref(this.fallbackShareWidgetRunnerResult.widget).onClose();
            let widgetRunner = WidgetRunner<ClipboardFormTemplatePropsData, ClipboardFormTemplate>(
                ClipboardFormTemplate, {
                    shareUrl: this.getLink(shareType),
                    onCompleted: () => {
                        widgetRunner.destroy();
                    }
                }
            );
        }
    }

    // 针对uc和qq浏览器
    ucQqInit() {
        let qApiSrc = {
            lower: "//3gimg.qq.com/html5/js/qb.js",
            higher: "//jsapi.qq.com/get?api=app.share"
        };
        let v = parseFloat(ua.split('qqbrowser/')[1].split(' ')[0]);
        this.loadIfNot(v > 5.4 ? qApiSrc.higher : qApiSrc.lower);
    }

    initWxShare() {
        const callback = () => {
            let { title, description, imgUrl, link } = this.shareInfo;
            window.wxshare.config();
            window.wxshare.reset({
                title,
                desc: description,
                link,
                imgUrl
            });
        };
        this.loadIfNot(hjweixinUrl, callback);
    }

    loadIfNot(url: string, callback?: () => void) {
        lazyLoadScript(url, () => {
            if (callback) {
                callback();
            }
            this.isInitScriptLoading = false;
        });
    }

    /**
     * 如果分享信息发生变化，则需要调用此方法
     * 
     */
    reset({ share_title, share_desc, share_url, share_img }) {
        let { shareInfo } = this;
        shareInfo.title = share_title;
        shareInfo.description = share_desc;
        shareInfo.imgUrl = share_img;
        shareInfo.link = share_url;
        // 只有微信环境，才需要再次重置
        if (isweixin) {
            this.initWxShare();
        }
    }

    /**
     * 重置webview右上角的原生分享按钮的样式和回调方法
     * 
     */
    resetAppShare() {
        if (!window.HJApp) {
            return;
        }
        let { afterShareCallback } = this;
        window.appshare = () => {
            if (!window.HJSDK) {
                hjc.showToast(utilityNotReadyMsg);
                return;
            }
            let {shareInfo: {title, description, link, imgUrl}} = this;
            let data = {
                title,
                description,
                link,
                imageUrl: imgUrl
            };
            window.HJSDK.invoke('service_share', data, ({ platform }) => {
                if (afterShareCallback) {
                    afterShareCallback(platform, targets[platform || '']);
                }
            });
        };

        let sharebtn = "share";
        if (!/android/i.test(navigator.userAgent)) {
            let m = /class\/([\d.]+)\/hjclass/i.exec(navigator.userAgent);
            let v = m ? m[1] : '';
            if (v < '4.5') {
                sharebtn = "https://n1image.hjfile.cn/zhuanti/2017/07/11/43da11ce09a2251f7da0d126ab826882.png";
            }
        }
        // tslint:disable:no-string-literal
        window.HJApp['navigator_setAction'](
            '{"data":[{"icon":"' + sharebtn + '","title":"share","actionName":"appshare"}]}', 'function(){}'
        );
        // tslint:enable
    }

    qqBrowserShare(tp: string): boolean {
        let toAppVal = {
            sina: 11,
            friend: 1,
            circle: 8,
            qq: 4,
            qzone: 3
        };
        let { title, description, imgUrl, link } = this.shareInfo;
        let ah = {
            url: link,
            title,
            description,
            img_url: imgUrl,
            img_title: title,
            to_app: toAppVal[tp],
            cus_txt: description
        };
        let res = false;
        if (window.browser && window.browser.app) {
            window.browser.app.share(ah);
            res = true;
        } else if (window.qb) {
            window.qb.share(ah);
            res = true;
        }
        return res;
    }

    ucBrowserShare(tp: string): boolean {
        if (tp == 'qzone') {
            return false;
        }
        let toAppVal = {
            sina: ['kSinaWeibo', 'SinaWeibo'],
            friend: ['kWeixin', 'WechatFriends'],
            circle: ['kWeixinFriend', 'WechatTimeline'],
            qq: ['kQQ', 'QQ'],
            qzone: ['kQZone', 'QZone']
        };
        let { title, link } = this.shareInfo;

        let to_app = toAppVal[tp][(ua.indexOf('iphone') + ua.indexOf('ipod') > -1) ? 0 : 1];
        let from = location.host;

        if (window.ucweb && window.ucweb.startRequest) {
            window.ucweb.startRequest("shell.page_share", [title, title, link, to_app, "", "@" + from, ""]);
        } else if (window.ucbrowser && window.ucbrowser.web_share) {
            window.ucbrowser.web_share(title, title, link, to_app, "", "@" + from, "");
        }
        return true;
    }

    appShare(): void {
        let { title, description, imgUrl, link } = this.shareInfo;
        let data = {
            title,
            description,
            imageUrl: imgUrl,
            link
        };
        window.HJSDK.invoke('service_share', data, ({ platform }) => {
            let { afterShareCallback } = this;
            if (afterShareCallback) {
                afterShareCallback(platform, targets[platform]);
            }
        });
    }

    getLink(tp: string) {
        let { title, description, imgUrl, link } = this.shareInfo;

        // tslint:disable:max-line-length
        switch (tp) {
            case 'sina':
                return `http://service.weibo.com/share/share.php?title=${title}&desc=${description}&pic=${imgUrl}&url=${link}`;
            case 'qzone':
                return `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=${title}&summary=${description}&pics=${imgUrl}&url=${link}`;
            default:
                return link;
        }
        // tslint:enable
    }

    fallbackShare() {
        this.fallbackShareWidgetRunnerResult = WidgetRunner<FallbackShareTemplatePropsData, FallbackShareTemplate>(
            FallbackShareTemplate, {
                onShareItemClick: this.onShareItemClick,
                ways: this.shareWays,
                onCompleted: () => {
                    this.fallbackShareWidgetRunnerResult.destroy();
                }
            }
        );
    }
}
