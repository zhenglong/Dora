import React, { DOMElement, BaseSyntheticEvent } from 'react';
import formValidation from '../../mixins/form-validation';
import Ajax from '../../mixins/ajax';
import styles from './index.scss';
import ImgSuccess from './images/success.png';
import AddressChooserWidget from '../address-chooser';

const config = {
    lotteryAddContractApi: '/classtopic/handler/lotteryAddContract',
};

export interface LotteryInputFormProps {
    cname: string;
    cimg: string;
    recordId: string;
    activityId: string;
    TopicID?: number;
    AreaID: number;
    onCompleted: () => void;
}

interface LotteryInputInnerState {
    name: string;
    mobile: string;
    region: string;
    address: string;
    msgTip: string;
    isNameError: boolean;
    isMobileError: boolean;
    isRegionError: boolean;
    isAddressError: boolean;
}

export default class LotteryInputFormWidget extends React.Component<LotteryInputFormProps, LotteryInputInnerState> {

    addressChooserRef: React.RefObject<AddressChooserWidget> = React.createRef();

    constructor(props: LotteryInputFormProps) {
        super(props);

        if (!props.TopicID) {
            props.TopicID = server_data.topicid;
        }

        this.state = {
            name: '',
            mobile: '',
            region: '',
            address: '',
            msgTip: '',
            isNameError: false,
            isMobileError: false,
            isRegionError: false,
            isAddressError: false
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.openAddressChooser = this.openAddressChooser.bind(this);
        this.onChangeDistrict = this.onChangeDistrict.bind(this);

        this.onNameChange = this.onNameChange.bind(this);
        this.onMobileChange = this.onMobileChange.bind(this);
        this.onAddressChange = this.onAddressChange.bind(this);
    }

    validate(): boolean {
        let {
            name, mobile, region, address, msgTip,
            isNameError, isMobileError, isRegionError, isAddressError 
        } = this.state;

        let newState = {
            isNameError,
            isMobileError,
            isRegionError,
            isAddressError,
            msgTip
        };
        if (!name) {
            newState.isNameError = true;
            newState.msgTip = '*请填写姓名';
            this.setState(newState);
            return;
        } else {
            newState.isNameError = false;
            newState.msgTip = '';
        }
        if (!mobile) {
            newState.isMobileError = true;
            newState.msgTip = '*请填写手机号';
            this.setState(newState);
            return false;
        } else {
            if (!formValidation.mobile(mobile)) {
                newState.isMobileError = true;
                newState.msgTip = '*请检查手机号格式是否正确';
                this.setState(newState);
                return false;
            } else {
                newState.isMobileError = false;
                newState.msgTip = '';
            }
        }

        if (!region) {
            newState.isRegionError = true;
            newState.msgTip = '*请检查地址选填是否完整';
            this.setState(newState);
            return;
        } else {
            newState.isRegionError = false;
            newState.msgTip = '';
        }

        if (!address) {
            newState.isAddressError = true;
            newState.msgTip = '*请检查地址选填是否完整';
            this.setState(newState);
            return;
        } else {
            newState.isAddressError = false;
            newState.msgTip = '';
        }

        this.setState(newState);
        return true;
    }

    submitData() {
        let {name, mobile, region, address} = this.state;
        let {TopicID, AreaID, activityId, recordId} = this.props;
        let param = {
            TopicID,
            AreaID,
            ActivityId: activityId,
            LotteryRecordsId: recordId,
            UserRealName: name,
            UserPhone: mobile,
            Areas: region,
            UserAddress: address
        };
        Ajax.post(config.lotteryAddContractApi, param).then(res => {
            this.props.onCompleted();
            this.showSuccessAlert();
        }, ([msg]) => {
            dorac.alert({
                title: 'SORRY~',
                body: msg || '信息提交失败，请联系客服MM~',
                buttons: [{
                    text: '我知道了'
                }]
            });
        });
    }

    showSuccessAlert() {
        let {cname} = this.props;
        if (dorac.ismc) {
            dorac.alert({
                title: '恭喜您已提交成功',
                body: <div className={styles['mc-success']}>网校君将尽快为您寄出奖品！</div>,
                buttons: [{
                    text: '炫耀一下',
                    click: () => {
                        dorac.hideAlert();
                        window.share.act();
                    }
                }]
            });
        } else {
            dorac.alert({
                title: '',
                body: <div className={styles.success}>
                    <div className={styles['s-line-block']}><img src={ImgSuccess} alt="" /></div>
                    <div className="s-line-block suc-tips">
                        恭喜您已提交成功！<p>网校君将尽快为您寄出奖品{cname}！</p>
                    </div>
                </div>,
                buttons: [{
                    text: '炫耀一下',
                    click: () => {
                        dorac.hideAlert();
                        window.share.act();
                    }
                }]
            });
        }
    }

    /**
     * 提交实物收件人表单
     * 
     */
    onSubmit() {
        if (!this.validate()) {
            return;
        }
        this.submitData();
    }

    openAddressChooser() {
        this.addressChooserRef.current.widget.current.openChooserPopup();
    }

    onChangeDistrict(val: string[]) {
        this.setState({
            region: val.join('')
        });
    }

    onNameChange(event: BaseSyntheticEvent) {
        this.setState({
            name: event.target.value
        });
    }

    onMobileChange(event: BaseSyntheticEvent) {
        this.setState({
            mobile: event.target.value
        });
    }
    
    onAddressChange(event: BaseSyntheticEvent) {
        this.setState({
            address: event.target.value
        });
    }
    
    render() {
        let {cname, cimg} = this.props;
        let {isNameError, isMobileError, isRegionError, isAddressError, msgTip} = this.state;
        return (
            <React.Fragment>
                <div className={styles.userInput}>
                    <dl className={styles['input-title']}>
                        <dt><img src={cimg} alt="" /></dt>
                        <dd>
                            手气要不要这么好！<br />恭喜得到{cname}！
                        <p>请仔细填写以下信息,以便奖品顺利寄送给您！</p>
                        </dd>
                    </dl>
                    <div className={styles['input-row']}>
                        <label>姓名</label>
                        <div className={styles['label-right']}>
                            <input type="text" value={this.state.name} 
                                onChange={this.onNameChange}
                                className={`realname ${isNameError ? styles.error : ''}`} />
                        </div>
                    </div>
                    <div className={styles['input-row']}>
                        <label>手机</label>
                        <div className={styles['label-right']}>
                            <input type="text" value={this.state.mobile} 
                                onChange={this.onMobileChange}
                                className={`cell ${isMobileError ? styles.error : ''}`} />
                        </div>
                    </div>
                    <div className={styles['input-row']}>
                        <label>地区</label>
                        <div className={styles['label-right']}>
                            <input type="text" 
                                className={`${styles.region} ${isRegionError ? styles.error : ''}`} 
                                readOnly value={this.state.region}
                                onClick={this.openAddressChooser} />
                        </div>
                    </div>
                    <div className={styles['input-row']}>
                        <label>地址</label>
                        <div className={`${styles['label-right']} ${styles['h-100']}`} >
                            <textarea className={`${styles.otheraddresscc} ${isAddressError ? styles.error : ''}`} 
                            value={this.state.address}
                                onChange={this.onAddressChange} cols={30} rows={10}></textarea>
                        </div>
                    </div>
                    <div className={styles['input-row']}>
                        <label></label>
                        <div className={`${styles['label-right']} ${styles['J-msg-tips']}`}>
                            <span className={styles.showError}>{msgTip}</span>
                        </div>
                    </div>
                </div>
                <AddressChooserWidget ref={this.addressChooserRef} 
                    {...{onChange: this.onChangeDistrict}} />
            </React.Fragment>
        );
    }
}