import ActionTypes from "./action-types";
import {DoraAction} from "../base-widget";

export function updateState(data): DoraAction<AlertOptions> {
    return {
        type: ActionTypes.UPDATE_STATE,
        data
    };
}