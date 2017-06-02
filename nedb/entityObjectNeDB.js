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
        this.sqlTemp = {
            qFn: []
        };
        this.queryParam = new Object();
        this.ctx = ctx;
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        this.sqlTemp.qFn.push(qFn);
        return this;
    }
    Join(qFn, entity, mainFeild) {
        this.joinParams || (this.joinParams = []);
        let feild = this.formateCode(qFn);
        let joinTableName = entity.toString();
        let mainTableName = this.toString();
        if (this.joinParams.length > 0) {
            mainTableName = this.joinParams[this.joinParams.length - 1].joinTableName;
        }
        if (mainFeild == null || mainFeild == undefined)
            mainFeild = "id";
        this.joinParams.push({
            joinTableName: joinTableName,
            joinSelectFeild: feild,
            mainTableName: mainTableName,
            mainFeild: mainFeild
        });
        return this;
    }
    Select(qFn) {
        return this;
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
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count) {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn, entity) {
        this.queryParam.OrderByFeildName = this.getFeild(qFn);
        this.queryParam.OrderByTableName = entity.toString();
        return this;
    }
    OrderByDesc(qFn, entity) {
        this.queryParam.IsDesc = true;
        this.OrderBy(qFn, entity);
        return this;
    }
    GroupBy(qFn) {
        this.queryParam.GroupByFeildName = this.getFeild(qFn);
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
            if (this.sqlTemp.qFn.length > 0) {
                if (this.HasJoin()) {
                    let mainResultList = yield this.ctx.Query(this.sqlTemp.qFn, this.toString(), this.sqlTemp.queryMode, null, this.sqlTemp.inq);
                    r = yield this.GenerateJoinResults(mainResultList);
                }
                else {
                    r = yield this.ctx.Query(this.sqlTemp.qFn, this.toString(), this.sqlTemp.queryMode, null, this.sqlTemp.inq);
                }
            }
            else {
                if (this.HasJoin()) {
                    let mainResultList = yield this.ctx.Query([x => true], this.toString());
                    r = yield this.GenerateJoinResults(mainResultList);
                }
                else {
                    r = yield this.ctx.Query([x => true], this.toString());
                }
            }
            this.sqlTemp = {
                qFn: []
            };
            let result = this.cloneList(r);
            if (this.queryParam) {
                let hasJoin = this.HasJoin();
                if (this.queryParam.OrderByFeildName) {
                    let orderByFiled = this.queryParam.OrderByFeildName;
                    let orderByTableName = this.queryParam.OrderByTableName;
                    if (this.queryParam.IsDesc) {
                        result = result.sort((a, b) => {
                            if (hasJoin) {
                                return b[orderByTableName][orderByFiled] - a[orderByTableName][orderByFiled];
                            }
                            else {
                                return b[orderByFiled] - a[orderByFiled];
                            }
                        });
                    }
                    else {
                        result = result.sort((a, b) => {
                            if (hasJoin) {
                                return a[orderByTableName][orderByFiled] - b[orderByTableName][orderByFiled];
                            }
                            else {
                                return a[orderByFiled] - b[orderByFiled];
                            }
                        });
                    }
                    ;
                    this.queryParam.OrderByFeildName = null;
                    this.queryParam.IsDesc = null;
                }
                if (this.queryParam.GroupByFeildName) {
                    let temp_r = [];
                    result.map(x => {
                        if (hasJoin) {
                            let key = x[this.toString().toLocaleLowerCase()][this.queryParam.GroupByFeildName];
                            let has = temp_r.find(x => x.key == key);
                            if (!has) {
                                temp_r.push({ key: key, value: x });
                            }
                        }
                    });
                    result = temp_r.map(x => x.value);
                }
                if (this.queryParam.SkipCount) {
                    result = result.splice(this.queryParam.SkipCount, result.length);
                    this.queryParam.SkipCount = null;
                }
                if (this.queryParam.TakeCount) {
                    result = result.splice(0, this.queryParam.TakeCount);
                    this.queryParam.TakeCount = null;
                }
                this.queryParam = null;
            }
            this.joinParams = null;
            return result;
        });
    }
    GenerateJoinResults(mainResultList, joinParsamsIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (joinParsamsIndex == null || joinParsamsIndex == undefined)
                joinParsamsIndex = 0;
            let joinParamsItem = this.joinParams[joinParsamsIndex];
            let newJoinParamsIndex = joinParsamsIndex + 1;
            let mainTableName = joinParamsItem.mainTableName;
            let newRows = [];
            for (let mrItem of mainResultList) {
                let mrItem_e;
                if (joinParsamsIndex == 0)
                    mrItem_e = mrItem[joinParamsItem.mainFeild];
                else {
                    mainTableName = null;
                    mrItem_e = mrItem[this.joinParams[joinParsamsIndex - 1].joinTableName.toLocaleLowerCase()][joinParamsItem.mainFeild];
                }
                let leftResultResult = yield this.ctx.Query([(x) => {
                        return x[joinParamsItem.joinSelectFeild] == mrItem_e;
                    }], joinParamsItem.joinTableName);
                if (leftResultResult.length == 0) {
                    newRows.push(this.GenerateNewRowItem(mainTableName, joinParamsItem.joinTableName, mrItem, null));
                }
                else {
                    for (let lrItem of leftResultResult) {
                        newRows.push(this.GenerateNewRowItem(mainTableName, joinParamsItem.joinTableName, mrItem, lrItem));
                    }
                }
            }
            if (joinParsamsIndex >= this.joinParams.length - 1) {
                return newRows;
            }
            else {
                return yield this.GenerateJoinResults(newRows, newJoinParamsIndex);
            }
        });
    }
    GenerateNewRowItem(mainTableName, joinTableName, mainItem, joinItem) {
        let newRowItem = {};
        if (mainTableName == null) {
            newRowItem = mainItem;
        }
        else {
            let currentTableName = mainTableName.toLocaleLowerCase();
            newRowItem[currentTableName] || (newRowItem[currentTableName] = {
                toString: function () { return currentTableName; }
            });
            newRowItem[currentTableName] = mainItem;
        }
        joinTableName = joinTableName.toLocaleLowerCase();
        newRowItem[joinTableName] || (newRowItem[joinTableName] = {
            toString: function () { return joinTableName; }
        });
        newRowItem[joinTableName] = joinItem;
        return newRowItem;
    }
    HasJoin() {
        return this.joinParams && this.joinParams.length > 0;
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
        this.sqlTemp.qFn = [() => true];
        this.sqlTemp.queryMode = dataContextNeDB_1.QueryMode.Contains;
        this.sqlTemp.inq = inq;
        return this;
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
    formateCode(qFn) {
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
        qFnS = qFnS.replace(/=>/g, "");
        qFnS = qFnS.trim();
        let p = this.getParameterNames(qFn)[0];
        qFnS = qFnS.substring(p.length, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "");
        return qFnS;
    }
    getParameterNames(fn) {
        const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const DEFAULT_PARAMS = /=[^,]+/mg;
        const FAT_ARROWS = /=>.*$/mg;
        const code = fn.toString()
            .replace(COMMENTS, '')
            .replace(FAT_ARROWS, '')
            .replace(DEFAULT_PARAMS, '');
        const result = code.slice(code.indexOf('(') + 1, code.indexOf(')') == -1 ? code.length : code.indexOf(')')).match(/([^\s,]+)/g);
        return result === null ? [] : result;
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