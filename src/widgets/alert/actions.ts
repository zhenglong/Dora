import ActionTypes from "./action-types";
import {HjAction} from "../base-widget";

export function updateState(data): HjAction<AlertOptions> {
    return {
        type: ActionTypes.UPDATE_STATE,
        data
    };
}