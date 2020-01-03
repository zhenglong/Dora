import { WidgetStore } from "../base-widget";
import * as reducers from './reducers';
import * as actionCreators from './actions';
import { AddressChooserActionDescribers, AddressChooserOptions, AreaInfo } from "./types";

export class AddressChooseWidgetStore extends WidgetStore<AddressChooserActionDescribers> {
    constructor(state?: AddressChooserOptions) {
        super();

        // 生成state的操作函数
        this.createStore(reducers, state, actionCreators);

        this.actions.updateProvinces();
    }
}