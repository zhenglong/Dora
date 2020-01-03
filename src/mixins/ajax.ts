import axios from 'axios';
import querystring from './querystring';

export interface HjResponse {
    data?: any;
    status: number;
    message?: string;
}

export default class Ajax {
    static get(url: string, params: object): Promise<HjResponse> {
        if (params) {
            let str = querystring.stringify(params);
            url = `${url}?${str}`;
        }
        return axios.get(url).then(res => {
            if (res.status == 200) {
                if (res.data && res.data.status) {
                    throw [res.data.message, res];
                }
                return res.data;
            } else {
                throw [res.data.message, res];
            }
        });
    }

    static post(url: string, params: object): Promise<HjResponse> {
        return axios.post(url, params).then(res => {
            if (res.status == 200) {
                if (res.data && res.data.status) {
                    throw [res.data.message, res];
                }
                return res.data;
            } else {
                throw [res.data.message, res];
            }
        });
    }
}