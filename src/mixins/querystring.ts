type QueryStringParseChecker = (v: string) => boolean;

function isBooleanParsed(v: string) {
    switch (v.toLowerCase()) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            return undefined;
    }
}

function parse(str: string) {
    let search: string = str || window.location.search.substr(1);
    let splitting: string[] = search.split('&');
    let obj = {};
    for (let i = 0; i < splitting.length; i++) {
        if (!splitting[i]) {
            continue;
        }
        // 拿到第一个等号的位置（value中可以包含等号）
        let idx = splitting[i].indexOf('=');
        if (idx < 1) {
            idx = splitting[i].length;
        }

        // 获取name和value
        let name = decodeURIComponent(splitting[i].substr(0, idx));
        let finalValue: string | string[] = null;
        let value: string = decodeURIComponent(splitting[i].substr(idx + 1));

        // 检查是否为bool或float
        let checks: QueryStringParseChecker[] = [isBooleanParsed];
        let result;
        for (let j = 0; j < checks.length; j++) {
            result = checks[j](value);
            if (result !== undefined) {
                break;
            }
        }
        // 是否为数组
        if (value.indexOf(',') != -1) {
            finalValue = value.split(',');
        } else {
            finalValue = value;
        }
        obj[name] = (result !== undefined) ? result : finalValue;
    }
    return obj;
}

function stringify(obj: object) {
    let properties = Object.getOwnPropertyNames(obj);
    let arr = [];
    for (let i = 0; i < properties.length; i++) {
        let val = obj[properties[i]];
        if (val === undefined || val === null) {
            continue;
        }
        arr.push(`${encodeURIComponent(properties[i])}=${encodeURIComponent(obj[properties[i]])}`);
    }
    return arr.join('&');
}

export default {
    parse,
    stringify
};