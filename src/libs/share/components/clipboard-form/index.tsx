import styles from './index.scss';
import React from 'react';
import lazyLoadScript from '../../../../mixins/lazy-load-script';
import Modal, { ModalWidgetPropsData, ContentPosition} from '../../../../widgets/popup';

export interface ClipboardFormTemplatePropsData extends ModalWidgetPropsData {
    /**
     * 需要复制的url字符串
     * 
     */
    shareUrl: string;
}

const resfileHost = 'https://res.hjfile.cn';

export default class ClipboardFormTemplate 
    extends React.Component<ClipboardFormTemplatePropsData> {

    isResourceLoaded: boolean = true;
    clipboard: any;
    modalRef: React.RefObject<Modal> = React.createRef();

    static unref: (refObject: React.RefObject<ClipboardFormTemplate> | ClipboardFormTemplate) => Modal;

    constructor(props: ClipboardFormTemplatePropsData) {
        super(props);

        this.onCopy = this.onCopy.bind(this);
    }

    componentDidMount() {
        this.isResourceLoaded = false;
        lazyLoadScript(`${resfileHost}/classecm/clipboard.min.js`, () => {
            this.isResourceLoaded = true;
            this.clipboard = new window.ClipboardJS(`.${styles['hjshare-btn-copy']}`);
            this.clipboard.on('success', () => {
                this.clipboard.destroy();
                this.clipboard = null;
                ClipboardFormTemplate.unref(this).onClose();
                dorac.showToast('复制成功');
            });
            this.clipboard.on('error', () => {
                this.clipboard.destroy();
                this.clipboard = null;
                dorac.showToast('请选择"拷贝"进行复制');
            });
        });
    }

    componentWillUnmount() {
        if (this.clipboard) {
            this.clipboard.destroy();
            this.clipboard = null;
        }
    }

    onCopy() {
        if (!this.isResourceLoaded) {
            dorac.showToast('复制组件正在初始化中，请稍候');
            return;
        }
    }

    render(): ReactNode {
        let { shareUrl } = this.props;
        let props = {
            ...this.props
        };
        if (props.contentPosition == null) {
            props.contentPosition = ContentPosition.bottom;
        }
        return (
            <Modal {...props} ref={this.modalRef}>
                <section className={styles["hjshare-list-wrapper"]}>
                    <div className={styles["hjshare-copy-link"]}>
                        <div className={styles["share-header"]}>复制一下网址，分享给以下好友</div>
                        <div className={styles["input-button-wrapper"]}>
                            <input type="text" className={styles["txt-share-url"]} value={shareUrl} readOnly />
                            <a href="javascript:void(0);" className={styles["hjshare-btn-copy"]}
                                data-clipboard-target={`.${styles["txt-share-url"]}`}
                                onClick={this.onCopy}>复制</a>
                        </div>
                    </div>
                </section>
            </Modal>  
        );
    }
}

ClipboardFormTemplate.unref = (refObj) => {
    return ((refObj as React.RefObject<ClipboardFormTemplate>).current
        || refObj as ClipboardFormTemplate).modalRef.current;
};