import ActionTypes from "./action-types";
import {HjAction} from "../base-widget";

export function updateState(data: LoadingOptions): HjAction<LoadingOptions> {
    return {
        type: ActionTypes.UPDATE_STATE,
        data
    };
}