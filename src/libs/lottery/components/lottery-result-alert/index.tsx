import React from 'react';
import styles from './index.scss';
import ImgNoChance from './images/no-chance.png';
import Alert from '../../../../widgets/alert';

export interface LotteryResultProps {
    isSuccess: boolean;
    /****************************
     * 如果isSuccess为true，
     * 下列字段有效
     */
    winImg?: string;
    prize_name?: string;
    cname?: string;
    /****************************/
    /**
     * 如果isSuccess为false，
     * 则此字段必填
     */
    msg?: string;
    onCompleted?: () => void;
}

export default class LotteryResultAlertTemplate extends React.Component<LotteryResultProps> {

    title: string = '';
    buttons: AlertButtonInfo[] = [];

    alertRef: React.RefObject<Alert> = React.createRef();

    constructor(props: LotteryResultProps) {
        super(props);
        
        this.onShare = this.onShare.bind(this);
    }

    componentDidMount() {
        this.alertRef.current.widget.current.show({
            title: this.title,
            buttons: this.buttons
        });
    }

    onShare() {
        if (this.props.onCompleted) {
            this.props.onCompleted();
        }
        window.share.act();
    }

    noChance() {
        let { msg } = this.props;
        let body = '';
        switch (msg) {
            case 'NoRight':
                this.title = 'SORRY~';
                this.buttons = [{
                    text: '我知道了'
                }];
                body = '抽奖失败，您没有权限抽奖！';
                break;
            case 'NoChance':
                body = '您没有多余机会抽奖咯~';
                break;
            case 'NotStart':
            case 'NotStarted':
                body = '抽奖未开始，请耐心等候~';
                break;
            case 'IsEnd':
            case 'AlreadyOver':
                body = '抽奖已结束，欢迎下次再来';
                break;
            default:
                this.title = '遇到错误啦~';
                this.buttons = [{
                    text: '我知道了'
                }];
                body = `<p class="${styles._err}">网络不是太理想，请稍后重试！</p`;
        }
        return (
            <div className={styles['cj-warn']}>
                <div className={styles['s-line-block']}><img src={ImgNoChance} alt='' /></div>
                <div className="s-line-block">
                    <p>{ body }</p>
                </div>
            </div>
        );
    }
    success() {
        let {winImg, cname} = this.props;
        return (
            [<div key="p-1" className={styles.success}>
                <div className={styles['s-line-block']}><img src={winImg} alt='' /></div>
                <div className={styles['s-line-block']}>
                    手气要不要这么好！<br />恭喜得到{cname}！
                </div>
            </div>,
            <a key="p-2" href="javascript:void(0);" className={styles['btn-confirm']} onClick={this.onShare}>炫耀一下</a>]
        );
    }

    render() {
        let {isSuccess} = this.props;
        return (
            <Alert ref={this.alertRef}>
                {isSuccess ? this.success() : this.noChance()}
            </Alert>
        );
    }
}