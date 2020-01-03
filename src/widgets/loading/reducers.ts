import ActionTypes from './action-types';
import {HjAction} from '../base-widget';

export default function reducer(state: LoadingOptions, action: HjAction<LoadingOptions>): LoadingOptions {
    switch (action.type) {
        case ActionTypes.UPDATE_STATE:
            return action.data;
        default:
            return state;
    }
}