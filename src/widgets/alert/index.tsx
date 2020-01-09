import { BaseWidget, PropsDataModel, IBaseWidget, BaseUIWidget } from "../base-widget";
import styles from './index.scss';
import React, { ReactNode } from 'react';
import { applyMixins } from '../../mixins/apply-mixin';
import { ConnectedComponentClass } from 'react-redux';
import { AlertWidgetStore } from './alert-widget-store';
import { AlertActionDescribers, InternalStateDataModel } from "./types";
import ConnectedComponent from '../../mixins/connected-component';
import unref from '../../mixins/unref';

const widgetClassName = styles['alert-widget'];

export default class AlertWidget extends
    React.Component<PropsDataModel<AlertActionDescribers, AlertWidgetStore>>
    implements BaseWidget, IBaseWidget {

    styles: any;

    store: AlertWidgetStore;
    widget: React.RefObject<AlertWidgetInner> = React.createRef();
    static unref: (refObject: React.RefObject<AlertWidget>) => AlertWidgetInner;

    constructor(props?: PropsDataModel<AlertActionDescribers, AlertWidgetStore>) {
        super(props);
        if (!props) {
            props = {
                useGlobalStore: false
            };
        }
        if (!props.useGlobalStore) {
            this.store = new AlertWidgetStore(props.initState || {});
        } else {
            this.store = props.store;
        }
    }

    versionNumber(): string {
        return '1.0.1';
    }

    render_: (ConnectedComponent: ConnectedComponentClass<any, any>, props: any) => React.ReactNode;

    render(): ReactNode {
        return this.render_(ConnectedAlertWidgetInner, {children: this.props.children});
    }
}

applyMixins(AlertWidget, [BaseWidget]);
AlertWidget.unref = unref<React.RefObject<AlertWidget>, AlertWidgetInner>();

class AlertWidgetInner extends React.Component<AlertOptions, InternalStateDataModel> implements BaseUIWidget {
    savedScrollTop: number = 0;
    static contextType = BaseWidget.ActionsContext;

    styles: any;

    constructor(props?: AlertOptions) {
        super(props);

        this.state = {
            isVisible: false,
        };
        this.styles = styles;
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    mergeStyles: (currentStyles: any, overridingStylesGetter: (styles: any) => any) => any;

    overrideStyles: (overridedStylesGetter: (currentStyles: any) => any) => void;

    render(): ReactNode {
        if (!this.state.isVisible) {
            return null;
        }
        if (!this.props) {
            return null;
        }
        let { title, body, buttons } = this.props;
        // if (!title && !body) {
        //     return null;
        // }
        if (!body && !this.props.children) {
            body = '';
        }
        let styles_ = this.styles;
        return (
            <div className={styles_['alert-widget']} >
                <div className={styles._masker}> </div>
                <div className={styles._dialog}>
                    <div className={styles._header} >
                        <p className={styles._title} > {title}</p>
                        <a href="javascript:void(0)" className={styles._close} onClick={this.hide} > </a>
                    </div>
                    {
                        typeof body == 'string' ? 
                            <div className={`${styles._body}`} dangerouslySetInnerHTML={{__html: body}}></div>
                            : <div className={`${styles._body}`} >{body || this.props.children}</div>
                    }
                    <div className={styles._foot} >
                        {
                            (buttons && buttons.length && buttons.map((button, index) => {
                                return (
                                    <a className={styles.btn} href={button.href}
                                        onClick={button.click || this.hide} key={index} >{button.text}</a>
                                );
                            })) || ''
                        }
                    </div>
                </div>
            </div>
        );
    }

    show(options?: AlertOptions): void {
        if (this.state.isVisible) {
            return;
        }
        let context = this.context;
        (context.actions as AlertActionDescribers).updateState(options || {});
        this.setState({
            isVisible: true
        });
        // v3.9bug:针对baiduboxapp的弹层 
        if (/baiduboxapp/i.test(navigator.userAgent)) {
            $('#class_gotop').trigger('click');
        }
        // 禁用滚动事件
        $(`.${widgetClassName}`).on('touchmove', e => {
            // 针对弹层body，底部按钮以及关闭按钮，不禁用事件
            if ($(e.target).closest(`.${widgetClassName}`).length == 0) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        // 键盘消失-ios第三方
        // safari wx浏览器
        if (!dorac.isandroid) {
            // 针对ios的第三方键盘：键盘消失
            $(document.body).on('focusout.alert-widget', 'input,textarea', () => {
                $(window).scrollTop(0);
            });
        }

        // 键盘消失-通用
        $(window).on('resize.alertWidget', () => {
            // 弹窗表单存在并且有输入框或者文本框
            if ($(`.${widgetClassName} input, .${widgetClassName} textarea`).length) {
                $(window).scrollTop(0);
            }
        });
    }

    hide(): void {
        if (!this.state.isVisible) {
            return;
        }
        $(document.body).off('focusout.alert-widget');
        $(window).off('resize.alert-widget');
        $('html,body').css({
            'height': '',
            'overflow': ''
        });
        if (this.savedScrollTop) {
            $(window).scrollTop(this.savedScrollTop);
            this.savedScrollTop = 0;
        }
        setTimeout(() => {
            this.setState({
                isVisible: false
            }, () => {
                if (this.props.onClosed) {
                    this.props.onClosed();
                }
            });
        }, 10);

    }
}

applyMixins(AlertWidgetInner, [BaseUIWidget]);

const ConnectedAlertWidgetInner = ConnectedComponent(AlertWidgetInner);