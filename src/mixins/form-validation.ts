export default {
    mobile(s: string): boolean {
        return /^1\d{10}$/.test(s);
    },
    tel(s: string): boolean {
        return /(\d{3}[\s\-]?\d{8})|(\d{4}[\s\-]?\d{7})/.test(s);
    },
    email(s: string): boolean {
        return /^([a-z0-9][a-z0-9_\-\.]*)@([a-z0-9][a-z0-9\.\-]{0,20})\.([a-z]{2,4})$/i.test(s);
    },
    namecn(s: string): boolean {
        return /^[\u4e00-\u9fa5]{2,5}$/.test(s);
    },
    nameen(s: string): boolean {
        return /^[a-z]{2,20}(\s[a-z]{1,20})*$/i.test(s);
    }
};