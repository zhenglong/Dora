import $ from 'jquery';

global.$ = global.jQuery = $;
global.dorac = {
    isios: false,

    alert: () => {},
    hideAlert: () => {},
    loading: (msg?: string): void => {
       
    },
    hideLoading: () => {},
    showToast: () => {}
};