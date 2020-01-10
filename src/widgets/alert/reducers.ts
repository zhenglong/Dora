import ActionTypes from './action-types';
import {DoraAction} from '../base-widget';

export default function reducer(state: AlertOptions, action: DoraAction<AlertOptions>): AlertOptions {
    switch (action.type) {
        case ActionTypes.UPDATE_STATE:
            return action.data;
        default:
            return state;
    }
}