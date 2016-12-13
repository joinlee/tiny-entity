"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const dataContextNeDB_1 = require("./dataContextNeDB");
const entityObject_1 = require("../entityObject");
class EntityObjectNeDB extends entityObject_1.EntityObject {
    constructor(ctx) {
        super(ctx);
        this.sqlTemp = [];
        this.queryParam = new Object();
        this.ctx = ctx;
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        this.sqlTemp.push(qFn);
        return this;
    }
    Select(qFn) {
        return null;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.First(qFn);
            return r ? true : false;
        });
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let p = [];
            if (qFn)
                p.push(qFn);
            else
                p = null;
            let r = yield this.ctx.Query(p, this.toString(), dataContextNeDB_1.QueryMode.Count);
            return r;
        });
    }
    First(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.ctx.Query([qFn], this.toString(), dataContextNeDB_1.QueryMode.First);
            return this.clone(r, new Object());
        });
    }
    Take(count) {
        return null;
    }
    Skip(count) {
        return null;
    }
    OrderBy(qFn) {
        this.queryParam.OrderByFiledName = this.getFeild(qFn);
        return this;
    }
    OrderByDesc(qFn) {
        this.queryParam.IsDesc = true;
        this.OrderBy(qFn);
        return this;
    }
    Sum(qFn) {
        return __awaiter(this, void 0, void 0, function* () {
            let feild = this.getFeild(qFn);
            let r = yield this.ToList();
            let result = 0;
            r.forEach((x) => result += x[feild]);
            return result;
        });
    }
    ToList(queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let r;
            if (this.sqlTemp.length > 0) {
                r = yield this.ctx.Query(this.sqlTemp, this.toString());
            }
            else {
                r = yield this.ctx.Query([x => true], this.toString());
            }
            let result = this.cloneList(r);
            if (this.queryParam) {
                if (this.queryParam.OrderByFiledName) {
                    let orderByFiled = this.queryParam.OrderByFiledName;
                    if (this.queryParam.IsDesc) {
                        result = result.sort((a, b) => {
                            return b[orderByFiled] - a[orderByFiled];
                        });
                    }
                    else {
                        result = result.sort((a, b) => {
                            return a[orderByFiled] - b[orderByFiled];
                        });
                    }
                }
            }
            return result;
        });
    }
    Max(qFn) {
        return __awaiter(this, void 0, void 0, function* () {
            let feild = this.getFeild(qFn);
            let r = yield this.OrderByDesc(qFn).ToList();
            if (r && r.length > 0)
                return r[0];
            else
                return null;
        });
    }
    Min(qFn) {
        return __awaiter(this, void 0, void 0, function* () {
            let feild = this.getFeild(qFn);
            let r = yield this.OrderBy(qFn).ToList();
            if (r && r.length > 0)
                return r[0];
            else
                return null;
        });
    }
    Contains(feild, values) {
        let inq = {
            feildName: this.getFeild(feild),
            value: values
        };
        return this.ctx.Query(null, this.toString(), dataContextNeDB_1.QueryMode.Contains, null, inq);
    }
    clone(source, destination, isDeep) {
        if (!source)
            return null;
        destination = source;
        delete destination.sqlTemp;
        delete destination.queryParam;
        delete destination._id;
        delete destination.ctx;
        destination.toString = this.toString;
        return destination;
    }
    cloneList(list) {
        let r = [];
        list.forEach(x => {
            if (x)
                r.push(this.clone(x, new Object(), false));
        });
        return r;
    }
    formateCode(qFn, paramsKey, paramsValue) {
        let qFnS = qFn.toString();
        qFnS = qFnS.replace(/function/g, "");
        qFnS = qFnS.replace(/return/g, "");
        qFnS = qFnS.replace(/if/g, "");
        qFnS = qFnS.replace(/else/g, "");
        qFnS = qFnS.replace(/true/g, "");
        qFnS = qFnS.replace(/false/g, "");
        qFnS = qFnS.replace(/\{/g, "");
        qFnS = qFnS.replace(/\}/g, "");
        qFnS = qFnS.replace(/\(/g, "");
        qFnS = qFnS.replace(/\)/g, "");
        qFnS = qFnS.replace(/\;/g, "");
        qFnS = qFnS.trim();
        let p = qFnS[0];
        qFnS = qFnS.substring(1, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p, "gm"), this.toString());
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");
        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length)
                throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (isNaN)
                    v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
            }
        }
        return qFnS;
    }
    getFeild(qFn) {
        let qFns = this.formateCode(qFn);
        qFns = qFns.replace(/=>/g, "");
        let qList = qFns.split(".");
        if (qList.length > 2)
            throw "解析出错： getFeild(qFn): string";
        return qList[1];
    }
}
exports.EntityObjectNeDB = EntityObjectNeDB;
//# sourceMappingURL=entityObjectNeDB.js.map