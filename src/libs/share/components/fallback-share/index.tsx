import styles from './index.scss';

import React from 'react';
import Modal, { ModalWidgetPropsData, ContentPosition } from '../../../../widgets/popup';

export interface FallbackShareTemplatePropsData extends ModalWidgetPropsData {
    onShareItemClick?: (e: React.MouseEvent) => void;
    ways?: string[][];
    isweixin?: boolean;
}

export default class FallbackShareTemplate 
    extends React.Component<FallbackShareTemplatePropsData> {
    
    modalRef: React.RefObject<Modal> = React.createRef();

    static unref: (refObject: React.RefObject<FallbackShareTemplate> | FallbackShareTemplate) => Modal;
    
    constructor(props: FallbackShareTemplatePropsData) {
        super(props);
    }
    render(): ReactNode {
        let { ways, onShareItemClick, isweixin} = this.props;
        let props = {
            ...this.props
        };
        if (props.contentPosition == null) {
            props.contentPosition = ContentPosition.bottom;
        }
        return (
            <Modal {...props} ref={this.modalRef}>
                {
                    isweixin ? <div className={styles.tip_in_weixin}></div> :
                        <section className={styles["share-list-wrapper"]}>
                            <ul className={styles["share-list"]}>
                                {
                                    (ways && ways.length && ways.map((item: string[]) => {
                                        return (
                                            <li key={item[0]} data-type={item[0]} onClick={onShareItemClick}>
                                                <i className={styles[`share-icon-${item[0]}`]}></i><br />{item[1]}
                                            </li>
                                        );
                                    })) || null
                                }
                            </ul>
                        </section>
                }
            </Modal>
        );
    }
}

FallbackShareTemplate.unref = (refObj) => {
    return ((refObj as React.RefObject<FallbackShareTemplate>).current 
        || refObj as FallbackShareTemplate).modalRef.current;
};