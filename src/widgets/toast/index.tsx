import styles from './index.scss';
import React from 'react';

interface ToastWidgetState {
    msg: string;
    isVisible: boolean;
}

export default class ToastWidget extends React.Component<any, ToastWidgetState> {

    timer: NodeJS.Timeout;
    static unref: (refObject: React.RefObject<ToastWidget>) => ToastWidget;

    constructor(props) {
        super(props);

        this.state = {
            msg: '',
            isVisible: false
        };

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    render(): ReactNode {
        let {isVisible, msg} = this.state;
        if (!isVisible) {
            return null;
        }

        return (
            <div className={styles.toast}>
                <div className={`${styles['sweet-overlay']} ${styles['mask-hide']}`} onClick={this.hide}></div>
                <div className={styles['sweet-toast']}>
                    <div className={styles.content}>
                        <p>{msg}</p>
                    </div>
                </div>
            </div>
        );
    }

    show(msg: string, duration: number = 2000): void {
        this.setState({
            isVisible: true,
            msg
        });
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.timer = null;
            this.hide();
        }, duration);
    }

    hide(): void {
        this.setState({
            isVisible: false,
            msg: ''
        });
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
ToastWidget.unref = (refObj: React.RefObject<ToastWidget>): ToastWidget => refObj.current;