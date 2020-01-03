import { IActionDescribers } from "../base-widget";

export interface LoadingActionDescribers extends IActionDescribers {
    updateState: (newState: LoadingOptions) => void;
}

export interface InternalStateDataModel {
    isVisible: boolean;
}