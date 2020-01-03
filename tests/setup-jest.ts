import $ from 'jquery';

global.$ = global.jQuery = $;
global.hjc = {
    isios: false,

    alert: () => {},
    hideAlert: () => {},
    loading: (msg?: string): void => {
       
    },
    hideLoading: () => {},
    sendCustomEvent: (eventId: string, params: any) => {
        console.log(`${eventId} ${params}`);
    },
    showToast: () => {}
}