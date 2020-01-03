import { IActionDescribers } from "../base-widget";
export interface AlertActionDescribers extends IActionDescribers {
    updateState: (newState: AlertOptions) => void;
}
export interface InternalStateDataModel {
    isVisible: boolean;
}