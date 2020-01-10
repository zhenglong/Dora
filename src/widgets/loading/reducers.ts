import ActionTypes from './action-types';
import {DoraAction} from '../base-widget';

export default function reducer(state: LoadingOptions, action: DoraAction<LoadingOptions>): LoadingOptions {
    switch (action.type) {
        case ActionTypes.UPDATE_STATE:
            return action.data;
        default:
            return state;
    }
}