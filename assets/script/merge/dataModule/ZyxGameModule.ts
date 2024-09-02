import { typeGameInfo } from '../define/TypeDefine';
import DataModule from './DataModule';

export default class ZyxGameModule extends DataModule {

    gameInfo: typeGameInfo = null;

    constructor() {
        super();
    }

    parseData(data: any): void {
        super.parseData(data);

        this.gameInfo = data.gameInfo;

    }

    initUI(): void {

    }

}
export const zyxGameModule = new ZyxGameModule();
