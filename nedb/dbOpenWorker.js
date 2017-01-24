"use strict";
var Datastore = require("nedb");
var DBOpenWorker = (function () {
    function DBOpenWorker(option, callback) {
        this.interval = 200;
        this.option = option;
        this.callback = callback;
    }
    DBOpenWorker.prototype.BeginTask = function (interval) {
        if (interval)
            this.interval = interval;
        this.timer = setInterval(this.OpenDBTask.bind(this), this.interval);
    };
    DBOpenWorker.prototype.Destory = function () {
        if (this.timer)
            clearInterval(this.timer);
        if (this.OnDestory)
            this.OnDestory = null;
    };
    DBOpenWorker.prototype.OpenDBTask = function () {
        var _this = this;
        clearInterval(this.timer);
        var db = new Datastore(this.option.path);
        db.loadDatabase(function (err) {
            if (err)
                _this.timer = setInterval(_this.OpenDBTask.bind(_this), _this.interval);
            else {
                _this.callback(db);
                _this.OnDestory && _this.OnDestory();
            }
        });
    };
    return DBOpenWorker;
}());
exports.DBOpenWorker = DBOpenWorker;
var OpenWorkerManager = (function () {
    function OpenWorkerManager() {
        this.taskList = new WeakMap();
    }
    OpenWorkerManager.prototype.Task = function (task) {
        var _this = this;
        task.OnDestory = function () {
            if (_this.taskList.has(task.WorkId)) {
                task.Destory();
                _this.taskList.delete(task.WorkId);
                console.log("移除OpenDBWork，WorkId：" + task.WorkId);
            }
        };
        task.WorkId = { key: new Date().getTime() };
        this.taskList.set(task.WorkId, task);
        process.nextTick(task.BeginTask.bind(task));
    };
    return OpenWorkerManager;
}());
OpenWorkerManager.Current = new OpenWorkerManager();
exports.OpenWorkerManager = OpenWorkerManager;
//# sourceMappingURL=dbOpenWorker.js.map