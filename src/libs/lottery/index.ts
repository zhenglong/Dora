import Ajax from '../../mixins/ajax';
import LotteryInputFormAlertTemplate from './components/lottery-input-form-alert';
import LotteryResultAlertTemplate, { LotteryResultProps } from './components/lottery-result-alert';
import WidgetRunner from '../../mixins/widget-runner';
import { LotteryInputFormProps } from '../../widgets/lottery-input-form';

const config = {
    // 抽奖动作-
    lotteryApi: '/classtopic/handler/lottery',
    // 查询我的奖品-
    lotteryRecordsApi: '/classtopic/handler/lotteryRecords',
};

interface RenderTipsDataModel {
    isSuccess: boolean;
    prizeShortName: string;
    isReal: boolean;
    res: any;
    recordId: number;
}

export default class Lottery implements StandaloneUtility {

    options: LotteryOptions;
    ActivityId: string;
    getBeginTime: number;
    getLastTime: number;
    animate_time: number;
    isDoing: boolean;

    constructor(options: LotteryOptions) {
        if (!options.TopicID) {
            options.TopicID =  server_data.topicid;
        }
        this.options = options;
    }
    queryRecords(): Promise < any > {
        return Ajax.get(config.lotteryRecordsApi, {
            TopicID: this.options.TopicID,
            AreaID: this.options.AreaID
        }).then(res => {
            let resObj = {
                NotFillAddressFlag: false
            };
            let data = res.data;
            if (data && data.length > 0) {
                $.each(data, (i, val) => {
                    if (val.isReal && !val.userContactstruts && !resObj.NotFillAddressFlag) {
                        resObj = $.extend({}, val, {
                            NotFillAddressFlag: true
                        });
                    }
                    return true;
                });
            } else {
                resObj.NotFillAddressFlag = false;
            }
            return resObj;
        });
    }

    lotteryAsync(): Promise <RenderTipsDataModel> {
        return Ajax.get(config.lotteryApi, {
            TopicID: this.options.TopicID,
            AreaID: this.options.AreaID
        }).then(res => {
            // 成功打点
            let data = res.data;
            hjc.sendCustomEvent('topic_lottory_success', {
                TopicID: this.options.TopicID,
                AreaID: this.options.AreaID,
                RecordId: data.recordId
            });

            this.ActivityId = data.activityId;
            return $.extend({}, {
                isSuccess: true
            }, res);
        }, err => {
            return $.extend({}, {
                isSuccess: false
            }, {
                res: err
            });
        });
    }

    act(): void {
        if (this.isDoing) {
            return;
        }
        hjc.loading('玩命抽奖中...');
        this.isDoing = true;
        this.queryRecords().then(resFlagObj => {
            // 上一次抽奖没有填写地址
            if (resFlagObj.NotFillAddressFlag) {
                hjc.hideLoading();
                this.ActivityId = resFlagObj.activityId;
                let $curPrize = $('[data-code="' + resFlagObj.prizeCode + '"]');
                let prizeName: string = $curPrize.data('name');
                let prizeImg: string = $curPrize.data('winimg');
                let widgetRunner = WidgetRunner<LotteryInputFormProps, LotteryInputFormAlertTemplate>(
                    this.options.inputFormAlertTemplate || LotteryInputFormAlertTemplate, {
                    cname: prizeName,
                    cimg: prizeImg,
                    AreaID: this.options.AreaID,
                    TopicID: this.options.TopicID,
                    recordId: resFlagObj.recordId,
                    activityId: this.ActivityId,
                    onCompleted: () => {
                        widgetRunner.destroy();
                        this.isDoing = false;
                    }
                });
            } else {
                this.lotteryAsync().then(res_data => {
                    hjc.hideLoading();
                    this.getLastTime = new Date().getTime();
                    // 接口调用时间
                    let during_time = this.getLastTime - this.getBeginTime;
                    let time_str = 0;
                    if (this.animate_time) {
                        time_str = Math.max(during_time, this.animate_time);
                    }
                    setTimeout(() => {
                        if (res_data.isSuccess) {
                            let widgetRunner = WidgetRunner<LotteryResultProps, LotteryResultAlertTemplate>(
                                this.options.inputFormAlertTemplate || LotteryResultAlertTemplate, {
                                isSuccess: true,
                                winImg: '',
                                prize_name: '',
                                cname: '',
                                onCompleted: () => {
                                    widgetRunner.destroy();
                                    this.isDoing = false;
                                }
                            });
                        } else {
                            let widgetRunner = WidgetRunner<LotteryResultProps, LotteryResultAlertTemplate>(
                                this.options.resultAlertTemplate || LotteryResultAlertTemplate, {
                                isSuccess: false,
                                msg: res_data.res[0],
                                onCompleted: () => {
                                    widgetRunner.destroy();
                                    this.isDoing = false;
                                }
                            });
                        }
                    }, time_str);
                });
            }
        }, ([msg]) => {
            hjc.hideLoading();
            hjc.alert({
                body: msg || '服务器出错啦~'
            });
            this.isDoing = false;
        });
    }
}