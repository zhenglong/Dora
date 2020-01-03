function cacheable(fn: any, context?: any) {
    let __cache__ = {};
    // 需要使用arguments，所以这个地方不使用arguments
    // tslint:disable:only-arrow-functions
    return function() {
        let args = [].slice.call(arguments, 0);
        args.push(__cache__);
        return fn.apply(context || null, args);
    };
    // tslint:enable
}

const lazyLoadScript: (src: string, cb?: () => any) => void
    = cacheable((src: string, cb?: () => any, __cache__?: any): void => {
    if (typeof cb != 'function') {
        __cache__ = cb;
        cb = null;
    }
    if (__cache__[src]) {
        if (cb) {
            cb();
        }
        return;
    }
    let scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.src = src;
    scriptElem.onload = (): void => {
        __cache__[src] = true;
        if (cb) {
            cb();
        }
    };
    document.getElementsByTagName('body')[0].appendChild(scriptElem);
});

export default lazyLoadScript;