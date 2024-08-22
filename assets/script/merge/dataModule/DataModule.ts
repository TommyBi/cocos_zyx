export default class DataModule {
    public mData = null;

    public constructor() { }

    parseData(data: any): void {
        this.mData = data;
    }
}
