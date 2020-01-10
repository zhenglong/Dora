import ActionTypes from './action-types';
import {DoraAction} from '../base-widget';
import { AreaInfo } from './types';

export function provinces(state: AreaInfo[] = [], action: DoraAction<AreaInfo[]>): AreaInfo[] {
    switch (action.type) {
        case ActionTypes.UPDATE_PROVINCE_LIST:
            return action.data;
        default:
            return state;
    }
}

export function cities(state: AreaInfo[] = [], action: DoraAction<AreaInfo[]>): AreaInfo[] {
    switch (action.type) {
        case ActionTypes.UPDATE_CITY_LIST:
            return action.data;
        default:
            return state;
    }
}

export function districts(state: AreaInfo[] = [], action: DoraAction<AreaInfo[]>): AreaInfo[] {
    switch (action.type) {
        case ActionTypes.UPDATE_DISTRICT_LIST:
            return action.data;
        default:
            return state;
    }
}

export function provinceId(state: number = 0, action: DoraAction<number>): number {
    switch (action.type) {
        case ActionTypes.UPDATE_CURRENT_PROVINCE:
            return action.data;
        default:
            return state;
    }
}

export function cityId(state: number = 0, action: DoraAction<number>): number {
    switch (action.type) {
        case ActionTypes.UPDATE_CURRENT_CITY:
            return action.data;
        default:
            return state;
    }
}

export function districtId(state: number = 0, action: DoraAction<number>): number {
    switch (action.type) {
        case ActionTypes.UPDATE_CURRENT_DISTRICT:
            return action.data;
        default:
            return state;
    }
}