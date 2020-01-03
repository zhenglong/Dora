import styles from './index.scss';
import React from 'react';

export enum ContentPosition {
    top,
    center,
    bottom
}
export interface ModalWidgetPropsData {
    contentPosition?: ContentPosition;
    onCompleted?: () => void;
}
interface ModalWidgetState {
    isVisible: boolean;
}

const positionCls = ['top', 'center', 'bottom'];

export default class Popup extends React.Component<ModalWidgetPropsData, ModalWidgetState> {
    constructor(props: ModalWidgetPropsData) {
        super(props);

        this.state = {
            isVisible: true
        };

        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        this.setState({
            isVisible: false
        }, () => {
            if (this.props.onCompleted) {
                this.props.onCompleted();
            }
        });
    }

    render(): ReactNode {
        if (!this.state.isVisible) {
            return null;
        }
        let {contentPosition, children} = this.props;
        return (
            <div className={styles["hjshare-wrap"]}>
                <div className={styles["hjshare-mask"]} onClick={this.onClose}></div>
                <div className={`${styles["hjshare-content"]} ${styles[positionCls[contentPosition]]}`}>
                    {children}
                </div>
            </div>
        );
    }
}