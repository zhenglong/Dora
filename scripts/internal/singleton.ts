export default class Singleton {

    versionMapping: any;

    private static _instance: Singleton = null;

    static instance(): Singleton {
        if (!Singleton._instance) {
            Singleton._instance = new Singleton();
        }
        return Singleton._instance;
    }

    private constructor() {
        this.versionMapping = {};
    }
}