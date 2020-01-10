import { BaseWidget, PropsDataModel, IBaseWidget, BaseUIWidget } from "../base-widget";
import styles from './index.scss';
import React, { ReactNode } from 'react';
import { applyMixins } from '../../mixins/apply-mixin';
import { ConnectedComponentClass } from 'react-redux';
import { LoadingWidgetStore } from './loading-widget-store';
import { InternalStateDataModel, LoadingActionDescribers} from "./types";
import ConnectedComponent from "../../mixins/connected-component";
import unref from "../../mixins/unref";

export default class LoadingWidget 
    extends React.Component<PropsDataModel<LoadingActionDescribers, LoadingWidgetStore>>
    implements BaseWidget, IBaseWidget {

    store: LoadingWidgetStore;
    widget: React.RefObject<LoadingWidgetInner> = React.createRef();
    static unref: (refObject: React.RefObject<LoadingWidget>) => LoadingWidgetInner;

    constructor(props?: PropsDataModel<LoadingActionDescribers, LoadingWidgetStore>) {
        super(props);
        if (!props) {
            props = {
                useGlobalStore: false
            };
        }
        if (!props.useGlobalStore) {
            this.store = new LoadingWidgetStore(props.initState || {});
        } else {
            this.store = props.store;
        }
    }

    versionNumber(): string {
        return '1.0.0';
    }

    render_: (ConnectedComponent: ConnectedComponentClass<any, any>, props?: any) => React.ReactNode;

    render(): ReactNode {
        return this.render_(ConnectedLoadingWidgetInner);
    }
}
applyMixins(LoadingWidget, [BaseWidget]);
LoadingWidget.unref = unref<React.RefObject<LoadingWidget>, LoadingWidgetInner>();

class LoadingWidgetInner extends React.Component<LoadingOptions, InternalStateDataModel> implements BaseUIWidget {

    static contextType = BaseWidget.ActionsContext;

    styles: any;

    constructor(props: LoadingOptions) {
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
        let styles_ = this.styles;
        return (
            <div className={styles_['loading-widget']} >
                <div className={styles_.loading} >
                    <p>{this.props.msg}</p>
                </div >
            </div>
        );
    }

    show(options: LoadingOptions) {
        if (this.state.isVisible) {
            return;
        }
        let context = this.context;
        (context.actions as LoadingActionDescribers).updateState(options);
        this.setState({
            isVisible: true
        });
    }

    hide() {
        if (!this.state.isVisible) {
            return;
        }
        this.setState({
            isVisible: false
        });
    }
}

applyMixins(LoadingWidgetInner, [BaseUIWidget]);

const ConnectedLoadingWidgetInner = ConnectedComponent(LoadingWidgetInner);