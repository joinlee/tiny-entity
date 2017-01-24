"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var LocalIndexedDB = (function () {
    function LocalIndexedDB(dbName, dbVersion, tbsObj) {
        this._dbFactory = window.indexedDB || window.msIndexedDB;
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.tbsObj = tbsObj;
    }
    LocalIndexedDB.prototype.Open = function () {
        var _this = this;
        var request = this._dbFactory.open(this.dbName, this.dbVersion);
        request.onupgradeneeded = function (evt) {
            var db = evt.currentTarget.result;
            _this._db = db;
            _this.tbsObj.forEach(function (item) {
                if (db.objectStoreNames.contains(item.TableName)) {
                    db.deleteObjectStore(item.TableName);
                }
                var store = db.createObjectStore(item.TableName, { autoIncrement: true });
                if (item.IndexDefines) {
                    item.IndexDefines.forEach(function (indexItem) {
                        store.createIndex(indexItem.IndexName, indexItem.FieldName, { unique: indexItem.IsUnique });
                    });
                }
            });
        };
        return new Promise(function (resolve, reject) {
            request.onsuccess = function (ev) {
                _this._db = ev.target.result;
                resolve(_this._db);
            };
            request.onerror = function (evt) {
                reject(evt);
            };
        });
    };
    LocalIndexedDB.prototype.GetTransaction = function (tbNames, mode) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._db)
                            return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.Open()];
                    case 1:
                        _a._db = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this._db.transaction(tbNames, mode.Value)];
                }
            });
        });
    };
    LocalIndexedDB.prototype.GetStore = function (tbName, trans) {
        return trans.objectStore(tbName);
    };
    LocalIndexedDB.prototype.GetStoreIndex = function (store, indexName) {
        return store.index(indexName);
    };
    LocalIndexedDB.prototype.GetIndexCursor = function (index, fn, range) {
        index.openCursor(range).onsuccess = function (evt) {
            fn(evt.target.result);
        };
    };
    LocalIndexedDB.prototype.GetCursor = function (store, fn, range) {
        store.openCursor(range).onsuccess = function (evt) {
            fn(evt.target.result);
        };
    };
    LocalIndexedDB.prototype.GetById = function (store, value, fn) {
        var index = store.index("Id");
        var dbRequest = store.get(value);
        dbRequest.onsuccess = function (evt) {
            fn && fn(evt.target.result);
        };
    };
    LocalIndexedDB.prototype.Close = function () {
        this._db.close();
    };
    LocalIndexedDB.prototype.DeleteDataBase = function (dbName) {
        this._dbFactory.deleteDatabase(dbName);
    };
    return LocalIndexedDB;
}());
exports.LocalIndexedDB = LocalIndexedDB;
var DBTranscationModel = (function () {
    function DBTranscationModel(name, value) {
        this._name = name;
        this._value = value;
    }
    Object.defineProperty(DBTranscationModel.prototype, "Name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DBTranscationModel.prototype, "Value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    return DBTranscationModel;
}());
DBTranscationModel.ReadOnly = new DBTranscationModel("只读", "readonly");
DBTranscationModel.Readwrite = new DBTranscationModel("读写", "readwrite");
DBTranscationModel.Versionchange = new DBTranscationModel("版本变更", "versionchange");
exports.DBTranscationModel = DBTranscationModel;
//# sourceMappingURL=indexedDB.js.map