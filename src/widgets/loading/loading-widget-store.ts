import { IActionDescribers, WidgetStore } from "../base-widget";
import loadingReducer from './reducers';
import * as actionCreators from './actions';
import { LoadingActionDescribers } from "./types";

export class LoadingWidgetStore extends WidgetStore<LoadingActionDescribers> {
    constructor(state?: LoadingOptions) {
        super();

        // 生成state的操作函数
        this.createStore(loadingReducer, state, actionCreators);
    }
}