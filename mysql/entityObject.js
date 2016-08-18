///<reference path="typings/tinyDB.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * EntityObject
 */
class EntityObject {
    constructor(ctx) {
        this.sqlTemp = [];
        this.queryParam = new Object();
        this.ctx = ctx;
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        let sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        console.log(sql);
        this.sqlTemp.push(sql);
        return this;
    }
    Select(qFn) {
        let filed = this.formateCode(qFn);
        this.queryParam.SelectFileds = filed.split("AND");
        return this;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        let result = this.Count(qFn, paramsKey, paramsValue, queryCallback);
        return result > 0;
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
        let sql = "";
        if (qFn) {
            sql = "SELECT COUNT(id) FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT COUNT(id) FROM " + this.toString();
        }
        sql = this.addQueryStence(sql) + ";";
        let r = this.ctx.Query(sql);
        let result = r ? r[0]["COUNT(id)"] : 0;
        return result;
    }
    Contains(feild, values) {
        return __awaiter(this, void 0, void 0, function* () {
            let filed = this.formateCode(feild);
            if (values && values.length > 0) {
                let sql = "";
                if (isNaN(values[0])) {
                    for (let i = 0; i < values.length; i++) {
                        values[i] = "'" + values[i] + "'";
                    }
                }
                sql = "SELECT * FROM " + this.toString() + " WHERE " + filed + " IN (" + values.join(",") + ");";
                let row = yield this.ctx.Query(sql);
                return this.cloneList(row && row['0']);
            }
        });
    }
    First(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, Promise, function* () {
            let sql;
            if (qFn) {
                sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
            }
            else {
                sql = "SELECT * FROM " + this.toString();
            }
            this.Skip(0);
            this.Take(1);
            sql = this.addQueryStence(sql) + ";";
            let row = yield this.ctx.Query(sql);
            let obj;
            if (row && row[0] && row[0].length > 0) {
                obj = row[0][0];
            }
            if (obj)
                return this.clone(obj, new Object());
            else
                return null;
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
    OrderBy(qFn) {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    }
    OrderByDesc(qFn) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    }
    ToList(queryCallback) {
        let row;
        if (this.sqlTemp.length > 0) {
            let sql = this.sqlTemp[0];
            sql = this.addQueryStence(sql) + ";";
            row = this.ctx.Query(sql);
        }
        else {
            let sql = "SELECT * FROM " + this.toString();
            sql = this.addQueryStence(sql) + ";";
            row = this.ctx.Query(sql);
        }
        return this.cloneList(row);
    }
    Max(qFn) {
    }
    Min(qFn) {
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
        qFnS = qFnS.replace(/=>/g, "");
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
                if (isNaN(v))
                    v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
            }
        }
        return qFnS;
    }
    clone(source, destination, isDeep = false) {
        if (!source)
            return null;
        // for (var key in source) {
        //     if (typeof (key) != "function") {
        //         if (isDeep) { }
        //         else {
        //             if (typeof (key) != "object") {
        //                 destination[key] = source[key];
        //             }
        //         }
        //     }
        // }
        destination = JSON.parse(JSON.stringify(source));
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
    addQueryStence(sql) {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDERBY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc)
                sql += " DESC";
        }
        if ((this.queryParam.TakeCount != null && this.queryParam.TakeCount != undefined) && (this.queryParam.SkipCount != null && this.queryParam.SkipCount != undefined)) {
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    }
    clearQueryParams() {
        this.queryParam = new Object();
    }
}
exports.EntityObject = EntityObject;
//# sourceMappingURL=entityObject.js.map