import Datastore = require("nedb");

export class DBOpenWorker {
    private timer: number;
    private option: { path: string };
    private interval: number = 200;
    private callback;
    private workId: number;
    get WorkId() { return this.workId; }
    constructor(option: { path: string }, callback: (db: Datastore) => void) {
        this.option = option;
        this.callback = callback;
        this.workId = new Date().getTime();
    }

    BeginTask(interval?: number) {
        if (interval) this.interval = interval;
        this.timer = setInterval(this.OpenDBTask.bind(this), this.interval);
    }

    Destory() {
        if (this.timer) clearInterval(this.timer);
        if (this.OnDestory) this.OnDestory = null;
    }

    OnDestory: () => void;

    private OpenDBTask() {
        clearInterval(this.timer);
        let db = new Datastore(this.option.path);
        db.loadDatabase(err => {
            if (err) this.timer = setInterval(this.OpenDBTask.bind(this), this.interval);
            else {
                this.callback(db);
                this.OnDestory && this.OnDestory();
            }
        });
    }
}

export class OpenWorkerManager {
    static Current: OpenWorkerManager = new OpenWorkerManager();
    private taskList: WeakMap<number, DBOpenWorker> = new WeakMap();
    constructor() {
    }

    Task(task: DBOpenWorker) {
        task.OnDestory = () => {
            if (this.taskList.has(task.WorkId)) {
                task.Destory();
                this.taskList.delete(task.WorkId);
                console.log("移除OpenDBWork，WorkId：" + task.WorkId);
            }
        }
        this.taskList.set(task.WorkId, task);
        process.nextTick(task.BeginTask.bind(task));
    }
}