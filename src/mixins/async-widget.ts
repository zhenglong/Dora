export class Size {
    constructor(width: number = 0, height: number = 0) {
        this.width = width;
        this.height = height;
    }

    width: number;
    height: number;
}

export class AsyncWidgetMixin {
    /**
     * 返回widget预计的占位区域
     * 
     */
    get preferredSize(): Size {
        return new Size();
    }

    /**
     * widget加载中时，显示的界面
     * 
     */
    loadingPlaceholder(): string {
        return '';
    }

    /**
     * widget加载出错时，显示的界面
     * 
     */
    errorPlaceholder(): string {
        return '';
    }
}