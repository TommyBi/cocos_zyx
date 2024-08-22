export class EventManager extends cc.EventTarget {
    public static readonly Instance: EventManager = new EventManager();

    private constructor() {
        super();
    }

    dispatch(type: string, data?: any): void {
        this.dispatchEvent(new GameEvent(type, data))
    }
}

// 游戏事件
export class GameEvent extends cc.Event.EventCustom {
    public data: any = null;
    public type: string = '';
    constructor(type: string, data: any = null) {
        super(type, true);
        this.type = type;
        this.data = data;
    }
}

export const eventManager = EventManager.Instance;
