import ActionTypes from "./action-types";
import {DoraAction} from "../base-widget";

export function updateState(data: LoadingOptions): DoraAction<LoadingOptions> {
    return {
        type: ActionTypes.UPDATE_STATE,
        data
    };
}