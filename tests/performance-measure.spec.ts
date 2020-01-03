import PerformanceMeasure from '../src/mixins/performance-measure';

describe('perofrmance measure test set', () => {
    beforeAll(() => {
        console.log('before all');
    });

    afterAll(() => {
        console.log('after all');
    });

    test('performance measure basic functionality', (done) => {
        let start = PerformanceMeasure.start('start');
        setTimeout(() => {
            let duration = PerformanceMeasure.end(start);
            console.log('duration: ' + duration);
            expect(duration).toBeGreaterThan(1000);
            expect(duration).toBeLessThan(1500);
            done();
        }, 1000);
    });
});