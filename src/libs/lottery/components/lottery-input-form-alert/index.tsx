import React from 'react';
import Alert from '../../../../widgets/alert';
import LotteryInputForm, {LotteryInputFormProps} from '../../../../widgets/lottery-input-form';
import styles from './index.scss';

/**
 * 填写抽奖实物的弹框
 * 
 */
export default class LotteryInputFormAlertTemplate extends React.Component<LotteryInputFormProps> {

    alertRef: React.RefObject<Alert> = React.createRef();
    inputFormRef: React.RefObject<LotteryInputForm> = React.createRef();

    constructor(props: LotteryInputFormProps) {
        super(props);
    }

    componentDidMount() {
        this.alertRef.current.widget.current.overrideStyles(() => {
            return {
                'alert-widget': styles['alert-widget']
            };
        });
        this.alertRef.current.widget.current.show({
            buttons: [{
                text: '确认提交',
                click: () => {
                    this.inputFormRef.current.onSubmit();
                }
            }],
            onClosed: this.props.onCompleted
        });
    }

    componentWillUnmount() {
        console.log('will unmount');
    }

    render() {
        return (
            <Alert ref={this.alertRef}>
                <LotteryInputForm {
                    ...this.props
                } ref={this.inputFormRef}
                />
            </Alert>
        );
    }
}