import AlertWidget from '../src/widgets/alert';
import LoadingWidget from '../src/widgets/loading';
import React from 'react';
import ReactDOM from 'react-dom';
import { BaseWidget } from '../src/widgets/base-widget';
import Lottery from '../src/libs/lottery';
import McShare from '../src/libs/share';
import Toast from '../src/widgets/toast';
import ToastWidget from '../src/widgets/toast';

let alertWidget: React.RefObject<AlertWidget> = React.createRef();
let loadingWidget: React.RefObject<LoadingWidget> = React.createRef();
let toastWidget: React.RefObject<Toast> = React.createRef();

ReactDOM.render(
    <div>
        <AlertWidget ref={alertWidget} />
        <LoadingWidget ref={loadingWidget} />
        <Toast ref={toastWidget} />
    </div>,
    document.getElementById('app')
);

function debug(desc: string) {
    // $('#output').html(desc + '<br/>' + $('#output').html());
    // console.log(desc);
}

const ua = window.navigator.userAgent;

const obj = {
    isios: ua.indexOf('ios') > -1,
    
    alert: AlertWidget.unref(alertWidget).show,
    hideAlert: AlertWidget.unref(alertWidget).hide,
    loading: (msg?: string): void => {
        LoadingWidget.unref(loadingWidget).show({
            msg
        });
    },
    hideLoading: LoadingWidget.unref(loadingWidget).hide,
    showToast: ToastWidget.unref(toastWidget).show
};

console.log(`loading widget version: ${BaseWidget.versionOf(LoadingWidget)}`);
console.log(`alert widget version: ${BaseWidget.versionOf(AlertWidget)}`);

window.dorac = obj;

window.debug = debug;

window.lottery = (options: LotteryOptions): void => {
    let instance = new Lottery(options);
    instance.act();
};

window.share = new McShare();

console.log('11');

if (module.hot) {
    module.hot.accept();
}