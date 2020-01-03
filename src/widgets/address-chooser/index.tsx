import React, { RefObject, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import styles_ from './index.scss';
import {BaseWidget, IBaseWidget, PropsDataModel, BaseUIWidget} from '../base-widget';
import {AddressChooseWidgetStore} from './address-choose-widget-store';
import { AddressChooserOptions, AddressSelectionState, AddressChooserActionDescribers, AreaInfo } from './types';
import { ConnectedComponentClass } from 'react-redux';
import { applyMixins } from '../../mixins/apply-mixin';
import ConnectedComponent from '../../mixins/connected-component';
import PhysicsScroller from './physics-scroller';
import unref from '../../mixins/unref';

interface GetAreaCallbackArgs {
    areas: string;
    areastr?: string;
}

interface GetAreaOptions {
    callback: (args: GetAreaCallbackArgs) => void;
}

interface ZeptoTouchEvent extends Event {
    originalEvent: TouchEvent;
}

enum ScrollType {
    province,
    city,
    district
}

interface AddressChooserWidgetPropsData 
    extends PropsDataModel<AddressChooserActionDescribers, AddressChooseWidgetStore> {
    onChange?: (arr: string[]) => void;
}

export default class AddressChooserWidget 
    extends React.Component<AddressChooserWidgetPropsData> 
    implements BaseWidget, IBaseWidget {

    container: ZeptoCollection;
    options: GetAreaOptions;
    lastIndex: number;
    provinceTpl: string;

    store: AddressChooseWidgetStore;
    widget: React.RefObject<AddressChooserWidgetInner> = React.createRef();
    static unref: (refObject: React.RefObject<AddressChooserWidget>) => AddressChooserWidgetInner;

    constructor(props?: AddressChooserWidgetPropsData) {
        super(props);
        if (!props) {
            props = {
                useGlobalStore: false
            };
        }

        if (!props.useGlobalStore) {
            this.store = new AddressChooseWidgetStore(props.initState || {});
        } else {
            this.store = props.store;
        }
    }

    versionNumber(): string {
        return '1.0.0';
    }

    render_: (ConnectedComponent: ConnectedComponentClass<any, any>, props?: any) => React.ReactNode;

    render(): ReactNode {
        return this.render_(ConnectedAddressChooseWidgetInner, {onChange: this.props.onChange});
    }
}

applyMixins(AddressChooserWidget, [BaseWidget]);
AddressChooserWidget.unref = unref<React.RefObject<AddressChooserWidget>, AddressChooserWidgetInner>();

interface TouchData {
    x: number;
    y: number;
    time: number;
}

export class AddressChooserWidgetInner extends React.Component<AddressChooserOptions, AddressSelectionState>
    implements BaseUIWidget {

    static contextType = BaseWidget.ActionsContext;

    static middlePositionOffset = 2;

    static minMoveTime = 300;

    // 滚动项行高
    rowHeight: number = 0;

    containerRef: RefObject<HTMLDivElement> = null;

    provinceRef: RefObject<HTMLDivElement> = null;

    cityRef: RefObject<HTMLDivElement> = null;

    districtRef: RefObject<HTMLDivElement> = null;

    scrollType: number = null;

    // 自动调整滚动距离引起的scroll事件忽略掉
    isScrollIgnored: boolean = false;

    // 同一时刻最多一列允许滚动
    isInScroll: boolean = false;

    _startTouchInfo: TouchData;

    _scroller: PhysicsScroller = new PhysicsScroller(.5);

    scrollTop: number[] = [0, 0, 0];

    el: HTMLElement;

    styles: any;

    constructor(props: AddressChooserOptions) {
        super(props);

        this.state = {
            isVisible: false
        };

        this.containerRef = React.createRef();
        this.provinceRef = React.createRef();
        this.cityRef = React.createRef();
        this.districtRef = React.createRef();

        this.el = document.createElement('div');

        this.styles = styles_;

        this.openChooserPopup = this.openChooserPopup.bind(this);
        this.closeChooserPopup = this.closeChooserPopup.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.snapToGrid = this.snapToGrid.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onOk = this.onOk.bind(this);
    }

    mergeStyles: (currentStyles: any, overridingStylesGetter: (styles: any) => any) => any;

    overrideStyles: (overridedStylesGetter: (currentStyles: any) => any) => void;

    openChooserPopup() {
        this.setState({
            isVisible: true
        });
    }

    closeChooserPopup() {
        this.setState({
            isVisible: false
        });
    }

    onOk() {
        this.closeChooserPopup();
        if (this.props.onChange) {
            this.props.onChange(this.value());
        }
    }

    onTouchStart(e: ZeptoTouchEvent) {
        // 如果当前正在滚动，则需要停止滚动
        if (!this._startTouchInfo) {
            let point = e.originalEvent.changedTouches[0];

            this._startTouchInfo = {
                x: point.clientX,
                y: point.clientY,
                time: performance.now()
            };
            // 判断当前滚动的是哪个列表
            let {x} = this._startTouchInfo;
            let oneThirdWidth = window.innerWidth / 3;
            if (x <= oneThirdWidth) {
                this.scrollType = ScrollType.province;
            } else if (x <= oneThirdWidth * 2) {
                this.scrollType = ScrollType.city;
            } else {
                this.scrollType = ScrollType.district;
            }
        }
    }

    onTouchEnd(e: ZeptoTouchEvent) {
        // 如果touch end事件时，移动速度大于某个阈值，则触发物理滚动
        // 否则，直接吸附到边线
        let offsetY = this._startTouchInfo.y - e.originalEvent.changedTouches[0].clientY;
        window.debug(`offsetY: ${offsetY}, duration: ${performance.now() - this._startTouchInfo.time}`);
        let velocity = offsetY * 50 / (performance.now() - this._startTouchInfo.time);
        window.debug(`initial velocity: ${velocity}`);
        if (Math.abs(velocity) > PhysicsScroller.minVelocity) {
            window.debug(`scroller start`);
            this._scroller.start(velocity, {
                onScroll: this.onScroll(this.scrollType),
                onDone: () => {
                    this._startTouchInfo = null;
                    window.debug('end scroll');
                    window.debug('');
                    this.snapToGrid();
                }
            });
        } else {
            this.snapToGrid();
        }
    }

    onTouchMove(e: ZeptoTouchEvent) {
        // 对于慢速的移动，则跟随touch move事件滚动相应距离
        if (!this._startTouchInfo) {
            return;
        }
        let {scrollType} = this;
        let duration = window.performance.now() - this._startTouchInfo.time;
        let point = e.originalEvent.changedTouches[0];
        let offsetY = this._startTouchInfo.y - point.clientY;
        let elem = this.currentScrollList(scrollType);
        let maxHeight = $('ul', $(elem)).height() - $(elem).height();
        window.debug(`duration: ${duration}, offsetY: ${offsetY}, maxHeight: ${maxHeight}`);
        let val = Math.max(0, Math.min(this.scrollTop[scrollType] + offsetY, maxHeight));

        AddressChooserWidgetInner.scrollTo(elem, val);

        if (duration >= AddressChooserWidgetInner.minMoveTime) {
            this._startTouchInfo.time = performance.now();
            this._startTouchInfo.x = point.clientX;
            this._startTouchInfo.y = point.clientY;
            this.scrollTop[scrollType] = val;
        }
    }

    currentScrollList(scrollType: ScrollType): HTMLElement {
        let elem = null;
        switch (scrollType) {
            case ScrollType.province:
                elem = this.provinceRef.current;
                break;
            case ScrollType.city:
                elem = this.cityRef.current;
                break;
            case ScrollType.district:
                elem = this.districtRef.current;
                break;
        }
        return elem;
    }

    static scrollTo(elem: HTMLElement, val: number) {
        $('ul', $(elem)).css('transform', `translateY(-${val}px)`);
    }

    onScroll(scrollType: ScrollType) {
        return (offset: number): boolean => {
            let elem = this.currentScrollList(scrollType);
            window.debug(`original scrollTop: ${this.scrollTop[scrollType]}, offset: ${offset}`);
            this.scrollTop[scrollType] += offset;
            let maxHeight = $('ul', $(elem)).height() - $(elem).height();
            let res = false;
            if (this.scrollTop[scrollType] >= maxHeight) {
                // 如果已经到了底部，取消滚动
                this._scroller.cancel();
                this.scrollTop[scrollType] = maxHeight;
                res = true;
            } else if (this.scrollTop[scrollType] <= 0) {
                this._scroller.cancel();
                this.scrollTop[scrollType] = 0;
                res = true;
            }
            window.debug(`scrollTop: ${this.scrollTop[scrollType]}`);
            AddressChooserWidgetInner.scrollTo(elem, this.scrollTop[scrollType]);
            return res;
        };
    }

    snapToGrid() {
        let scrollType = this.scrollType;

        let elem = this.currentScrollList(scrollType);
        let scrollTop = this.scrollTop[scrollType];

        if (scrollTop % this.rowHeight) {
            // 获取当前选择的值，并触发后代列表更新
            let itemIndex = Math.round(scrollTop / this.rowHeight);
            let finalScrollTop = itemIndex * this.rowHeight;
            AddressChooserWidgetInner.scrollTo(elem, finalScrollTop);
            this.scrollTop[scrollType] = finalScrollTop;
            window.debug(`adjusted scrollTop: ${finalScrollTop}`);
            itemIndex += AddressChooserWidgetInner.middlePositionOffset;
            window.debug(`item index: ${itemIndex}`);
            let context = this.context;
            let actions = (context.actions as AddressChooserActionDescribers);
            switch (scrollType) {
                case ScrollType.province:
                    actions.selectProvince(this.props.provinces[itemIndex].id);
                    break;
                case ScrollType.city:
                    actions.selectCity(this.props.cities[itemIndex].id);
                    break;
                case ScrollType.district:
                    actions.selectDistrict(this.props.districts[itemIndex].id);
                    break;
            }
        } else {
            // 直接触发后代列表更新
            let itemIndex = scrollTop / this.rowHeight;
            itemIndex += AddressChooserWidgetInner.middlePositionOffset;
            window.debug(`final item index: ${itemIndex}`);
            let context = this.context;
            let actions = (context.actions as AddressChooserActionDescribers);
            switch (scrollType) {
                case ScrollType.province:
                    actions.selectProvince(this.props.provinces[itemIndex].id);
                    break;
                case ScrollType.city:
                    actions.selectCity(this.props.cities[itemIndex].id);
                    break;
                case ScrollType.district:
                    actions.selectDistrict(this.props.districts[itemIndex].id);
                    break;
            }
        }
    }

    componentDidMount() {
        // const debouncTime = 200;
        document.body.appendChild(this.el);
        this.rowHeight = $(`.${this.styles['middle-grey']}`).height();
        $(this.containerRef.current)
            .on('touchstart', this.onTouchStart)
            .on('touchend', this.onTouchEnd)
            .on('touchmove', this.onTouchMove);

        // 对于ios设备，禁用橡皮筋滚动效果
        let ua = window.navigator.userAgent.toLowerCase();
        if ((ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) && (ua.indexOf('mobile') > -1)) {
            document.body.addEventListener('touchmove', e => {
                e.preventDefault();
            }, { passive: false });
        }
    }

    componentWillUnmount() {
        this.el.remove();
    }

    render() {
        return ReactDOM.createPortal(this.renderUI(), this.el);
    }

    renderUI() {
        let { provinces, cities, districts, provinceId, cityId, districtId } = this.props;
        let {styles} = this;
        return (
            <div className={`${styles['address-chooser-widget']} ${!this.state.isVisible ? styles.hide : ''}`}>
                <div className={styles['header-wrapper']}>
                    <div className={styles.header}>
                        <a href="javascript:void(0);" className={`${styles.btn} ${styles['btn-cancel']}`}
                            onClick={this.closeChooserPopup}>取消</a>
                        <a href="javascirpt:void(0);" className={`${styles.btn} ${styles['btn-ok']}`}
                            onClick={this.onOk}>确定</a>
                    </div>
                </div>
                <div className={styles['selection-wrapper']} ref={this.containerRef}>
                    <div className={styles['top-shadow']}></div>
                    <div className={styles['bottom-shadow']}></div>
                    <div className={styles['middle-grey']}></div>
                    <div className={styles['column-container']}>
                        <div className={styles.column} ref={this.provinceRef}>
                            <ul className={styles['area-list']}>
                                {
                                    (provinces && provinces.length && provinces.map((province, index) => {
                                        return (
                                            <li className={`${styles['area-entry']} 
                                                ${ province.id == provinceId ? styles.selected : '' }`} 
                                                key={province.id}
                                                data-index={index}>
                                                {province.name}
                                            </li>
                                        );
                                    })) || null
                                }
                            </ul>
                        </div>
                        <div className={styles.column} ref={this.cityRef}>
                            <ul className={styles['area-list']}>
                                {
                                    (cities && cities.length && cities.map((city, index) => {
                                        return (
                                            <li className={`${styles['area-entry']} 
                                                ${city.id == cityId ? styles.selected : ''}`}
                                                key={city.id}
                                                data-index={index}>
                                                {city.name}
                                            </li>
                                        );
                                    })) || null
                                }
                            </ul>
                        </div>
                        <div className={styles.column} ref={this.districtRef}>
                            <ul className={styles['area-list']}>
                                {
                                    (districts && districts.length && districts.map((district, index) => {
                                        return (
                                            <li className={`${styles['area-entry']} 
                                                ${district.id == districtId ? styles.selected : ''}`}
                                                key={district.id}
                                                data-index={index}>
                                                {district.name}
                                            </li>
                                        );
                                    })) || null
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    value(): string[] {
        let { provinces, cities, districts, provinceId, cityId, districtId } = this.props;

        const currentValue = (arr: AreaInfo[], id: number) => {
            let item = arr.find(m => m.id == id);
            return item ? item.name : '';
        };
        return [
            currentValue(provinces, provinceId),
            currentValue(cities, cityId),
            currentValue(districts, districtId)
        ];
    }
}

const ConnectedAddressChooseWidgetInner = ConnectedComponent(AddressChooserWidgetInner);