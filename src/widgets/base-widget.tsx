import { createStore, bindActionCreators, Store, 
    Reducer, ReducersMapObject, combineReducers, applyMiddleware, Action } from 'redux';
import React from 'react';
import { Provider, ConnectedComponentClass } from 'react-redux';
import thunk from 'redux-thunk';

export interface HjAction<T> extends Action {
    data: T;
}

export interface IActionDescribers {
    // nothing to do
}

export interface PropsDataModel<W extends IActionDescribers, T extends WidgetStore<W>> {
    /**
     * 默认情况下，组件自己负责维护管理
     * 
     */
    useGlobalStore?: boolean;
    /**
     * 初始状态
     * 
     */
    initState?: any;
    /**
     * 如果使用全局store，则此字段不能为空
     * 
     */
    store?: T;
}

/**
 * redux store：组件可以自己管理，也可以把它托管给全局store统一管理
 * T - action对象接口定义合集
 * 
 */
export class WidgetStore<T extends IActionDescribers> {

    /**
     * 生成的redux store
     * 
     */
    observableStore: Store;

    /**
     * 数据状态操作函数
     * 
     */
    actions: T;

    createStore(reducers: Reducer | ReducersMapObject, initState: any, actionCreators: any) {
        let reducer: Reducer = null;
        if (typeof reducers == 'function') {
            reducer = reducers;
        } else {
            reducer = combineReducers(reducers);
        }
        this.observableStore = createStore(reducer, initState, applyMiddleware(thunk));
        this.actions = bindActionCreators(actionCreators, this.observableStore.dispatch);
    }
}

export interface IBaseWidget {
    /**
     * 版本号
     *
     */
    versionNumber(): string;

}

/**
 * 组件基类，负责粘合状态管理和界面视图
 * T为组件状态对象类型，如果为无状态组件，则T为any
 * 
 */
export class BaseWidget {
    constructor() {
        // nothing to do
    }

    /**
     * 负责维护组件的数据状态
     * 
     */
    store: WidgetStore<IActionDescribers>;

    widget: React.RefObject<React.Component>;
    render_(ConnectedComponent: ConnectedComponentClass<any, any>, props: any): React.ReactNode {
        return (
            <Provider store= { this.store.observableStore } >
                <BaseWidget.ActionsContext.Provider value={ { actions: this.store.actions } }>
                    <ConnectedComponent ref={ this.widget } {...props} />
                </BaseWidget.ActionsContext.Provider>
            </Provider>
        );
    }

    /**
     * 获取widget的版本号
     * 
     * @param TConstrutor - 继承自Widget的子类型 
     * 
     */
    static versionOf<T extends IBaseWidget>(TConstrutor: new () => T): string {
        return (new TConstrutor()).versionNumber();
    }

    static ActionsContext = React.createContext({ actions: {} });
}

/**
 * 如果UI组件需要其样式可以被外部覆盖，则混入该类。
 * 
 */
export class BaseUIWidget {
    /**
     * 组件样式css module对象
     * 可以在渲染之前把它改写掉，方便修改组件样式
     * 
     */
    styles: any;

    mergeStyles(currentStyles: any, overridingStylesGetter: (styles: any) => any): any {
        if (!overridingStylesGetter) {
            return currentStyles;
        }
        let overridingStyles = overridingStylesGetter(currentStyles);
        let keys = Object.getOwnPropertyNames(currentStyles);
        let res = {};
        for (let i = 0; i < keys.length; i++) {
            let val = overridingStyles[keys[i]];
            res[keys[i]] = val ? `${currentStyles[keys[i]]} ${val}` : currentStyles[keys[i]];
        }
        return res;
    }

    overrideStyles(overridedStylesGetter: (currentStyles: any) => any) {
        this.styles = this.mergeStyles(this.styles, overridedStylesGetter);
    }
}