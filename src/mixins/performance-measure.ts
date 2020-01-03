
const markEntries = {};

let globalIndex = 0;

class PerformancePolyfill {
    constructor() {
        // nothing to do
    }

    now() {
        return (window.performance && window.performance.now()) || (+new Date());
    }

    mark(entryName: string) {
        markEntries[entryName] = {
            name: entryName,
            entryType: 'mark',
            startTime: this.now(),
            duration: 0
        };
    }

    measure(measureName: string, startMark: string, endMark: string): void {
        let startMarkObj = markEntries[startMark];
        let endMarkObj = markEntries[endMark];
        markEntries[measureName] = {
            name: measureName,
            entryType: 'measure',
            startTime: this.now(),
            duration: endMarkObj.startTime - startMarkObj.startTime
        };
    }

    /**
     * 
     * @param name - 名称
     * @param type - mark | measure, 默认值mark
     */
    getEntriesByName(name: string, type: string = 'mark') {
        return [markEntries[name]];
    }

    /**
     * 清除测量点
     * @param markName - 测量点名称
     * 
     */
    clearMarks(markName?: string) {
        markEntries[markName] = null;
    }

    /**
     * 清除测量对象
     * @param markName - 测量对象名称
     *
     */
    clearMeasures(measureName: string) {
        markEntries[measureName] = null;
    }
}

const performanceInstance = (window.performance && window.performance.mark) ? 
    window.performance : new PerformancePolyfill();

export default {
    /**
     * 开始时间测量
     * 
     * @param markName - 测量点名称
     * 
     * @returns {PerformanceEntry} - 起始测量对象
     */
    start: (markName: string): PerformanceEntry => {
        let newMarkName = `${markName}-start-${globalIndex++}`;
        performanceInstance.mark(newMarkName);
        return performanceInstance.getEntriesByName(newMarkName)[0];
    },

    /**
     * 结束测量，并返回时间间隔
     * 
     * @param markObj - 起始测量对象
     * 
     * @returns {number} - 起始测量点到结束测量点之间的时间间隔，单位：毫秒 
     */
    end: (markObj: PerformanceEntry): number => {
        let markEndName = `${markObj.name}-end`;
        let measureName = `${markObj.name}-measure`;
        
        performanceInstance.mark(markEndName);
        performanceInstance.measure(measureName, markObj.name, markEndName);
        let measure = performanceInstance.getEntriesByName(measureName)[0];

        // 清理mark点和测量对象
        performanceInstance.clearMarks(markObj.name);
        performanceInstance.clearMarks(markEndName);
        performanceInstance.clearMeasures(measureName);

        return measure.duration;
    }
};