import ActionTypes from "./action-types";
import {HjAction} from "../base-widget";
import { AreaInfo } from "./types";

import Ajax from '../..//mixins/ajax';
const API_ADDRESS = '/api/address';

interface AreaResponseData {
    name: string;
    id: number;
}

/**
 * 本地缓存省份信息
 * 
 */
const cache = {};

const indexOffset = 2;

function convertData(data: AreaResponseData[]): AreaInfo[] {
    let items: AreaInfo[] = (data || []).map((item: AreaResponseData, index: number) => {
        //  默认选中第一个
        return {
            name: item.name,
            id: item.id,
            selected: !index
        };
    });
    let id = -1;
    for (let i = 0; i < indexOffset; i++) {
        items.unshift({
            name: '',
            id,
            selected: false
        });
        items.push({
            name: '',
            id: id - indexOffset
        })
        id--;
    }
    return items;
}

function fetchAreas(id: number = 0): Promise<AreaInfo[]> {
    let cachedItems = cache[id];
    if (cachedItems) {
        return Promise.resolve(convertData(cachedItems));
    }
    return Ajax.get(API_ADDRESS, {
        id
    }).then(({ data }) => {
        return convertData(data);
    });
}

/**
 * 更新省份列表，一般只会被调用一次
 * 
 * 
 */
export function updateProvinces() {
    return dispatch => {
        return fetchAreas().then((data: AreaInfo[]) => {
            dispatch({
                type: ActionTypes.UPDATE_PROVINCE_LIST,
                data
            });
            if (data && data.length) {
                dispatch(selectProvince(data[indexOffset].id));
            }
        });
    };
}

export function selectProvince(provinceId: number) {
    return dispatch => {
        return fetchAreas(provinceId).then((data: AreaInfo[]) => {
            dispatch({
                type: ActionTypes.UPDATE_CURRENT_PROVINCE,
                data: provinceId
            });
            dispatch(updateCities(data));
            if (data && data.length) {
                dispatch(selectCity(data[indexOffset].id));
            }
        });
    };
}

export function selectCity(id: number) {
    return dispatch => {
        return fetchAreas(id).then((data: AreaInfo[]) => {
            dispatch({
                type: ActionTypes.UPDATE_CURRENT_CITY,
                data: id
            });
            if (data && data.length) {
                dispatch(updateDistricts(data));
                if (data && data.length) {
                    dispatch(selectDistrict(data[indexOffset].id));
                }
            }
        });
    };
}

export function selectDistrict(id: number): HjAction<number> {
    return {
        type: ActionTypes.UPDATE_CURRENT_DISTRICT,
        data: id
    };
}

export function updateCities(data: AreaInfo[]): HjAction<AreaInfo[]> {
    return {
        type: ActionTypes.UPDATE_CITY_LIST,
        data
    };
}

export function updateDistricts(data: AreaInfo[]): HjAction<AreaInfo[]> {
    return {
        type: ActionTypes.UPDATE_DISTRICT_LIST,
        data
    };
}