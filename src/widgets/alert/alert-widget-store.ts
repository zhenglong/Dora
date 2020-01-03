import { WidgetStore } from "../base-widget";
import alertReducer from './reducers';
import * as actionCreators from './actions';
import { AlertActionDescribers } from "./types";
export class AlertWidgetStore extends WidgetStore<AlertActionDescribers> {
    constructor(state?: AlertOptions) {
        super();

        // 生成state的操作函数
        this.createStore(alertReducer, state, actionCreators);
    }
}