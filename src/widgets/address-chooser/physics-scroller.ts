import { debug } from "util";

export interface IPhysicsScrollerCallbacks {
    /**
     * 撤销滚动回调函数
     * 
     */
    onCancel?: () => void;
    /**
     * 滚动回调函数
     * 
     */
    onScroll: (movement: number) => boolean;
    /**
     * 滚动结束回调函数
     * 
     */
    onDone?: () => void;
}

export default class PhysicsScroller {

    // 触发physicis-scroll的最低速度
    static minVelocity = 0;

    velocity: number = 0;
    timer: number;
    callbacks: IPhysicsScrollerCallbacks;
    friction: number;
    private _timestamp: number = 0;

    constructor(friction: number = .03) {
        this.friction = friction;
    }

    start(velocity: number, callbacks: IPhysicsScrollerCallbacks) {
        this.velocity = velocity;
        this.callbacks = callbacks;
        if (this.timer) {
            cancelAnimationFrame(this.timer);
        }
        const act = (time: number) => {
            let passTime = ((time - this._timestamp) / 100);
            window.debug('');
            window.debug(`passTime: ${passTime}`);
            let movement = passTime * this.velocity;
            this.velocity -= Math.sign(this.velocity) * passTime * this.friction;
            window.debug(`velocity: ${this.velocity}; movement: ${movement};`);
            let isContinueAborted = this.callbacks.onScroll(movement);
            if (!isContinueAborted && Math.abs(this.velocity) > 1) {
                this.timer = requestAnimationFrame(act);
            } else {
                this.velocity = 0;
                this.timer = 0;
                this._timestamp = 0;
                if (this.callbacks.onDone) {
                    window.debug(`end natually`);
                    this.callbacks.onDone();
                }
            }
        };
        this._timestamp = performance.now();
        this.timer = requestAnimationFrame(act);
    }

    cancel() {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = 0;
        }
        
        if (this.callbacks.onCancel) {
            this.callbacks.onCancel();
        }

        this._timestamp = 0;
        window.debug('end because of cancellation');
        if (this.callbacks.onDone) {
            this.callbacks.onDone();
        }
    }
}