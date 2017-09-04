"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityCopier_1 = require("./../entityCopier");
const entityObject_1 = require("../entityObject");
class EntityObjectSqlite extends entityObject_1.EntityObject {
    constructor(ctx) {
        super(ctx);
        this.sqlTemp = [];
        this.queryParam = new Object();
        this.ctx = ctx;
    }
    Contains(feild, values) {
        return this;
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        let sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        this.sqlTemp.push(sql);
        return this;
    }
    Join(qFn, entity) {
        return this;
    }
    Select(qFn) {
        let filed = this.formateCode(qFn);
        this.queryParam.SelectFileds = filed.split("AND");
        return this;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.Count(qFn, paramsKey, paramsValue, queryCallback);
            return result > 0;
        });
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
        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }
    First(qFn, paramsKey, paramsValue, queryCallback) {
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
        let row = this.ctx.Query(sql);
        return new Promise((resolve, reject) => {
            resolve(this.clone(entityCopier_1.EntityCopier.Decode(row && row['0']), new Object()));
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
        return new Promise((resolve, reject) => {
            if (row.error) {
                reject(row);
            }
            else {
                resolve(this.cloneList(row));
            }
        });
    }
    Max(qFn) {
        return null;
    }
    Min(qFn) {
        return null;
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
                    v = "= '" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp("= " + paramsKey[i], "gm"), v);
            }
        }
        return qFnS;
    }
    clone(source, destination, isDeep) {
        if (!source)
            return null;
        for (var key in source) {
            if (typeof (key) != "function") {
                if (isDeep) { }
                else {
                    if (typeof (key) != "object") {
                        destination[key] = source[key];
                    }
                }
            }
        }
        return destination;
    }
    cloneList(list) {
        let r = [];
        list.forEach(x => {
            if (x)
                r.push(this.clone(entityCopier_1.EntityCopier.Decode(x), new Object(), false));
        });
        return r;
    }
    addQueryStence(sql) {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDER BY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc)
                sql += " DESC";
        }
        if (this.queryParam.TakeCount && this.queryParam.SkipCount) {
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    }
    clearQueryParams() {
        this.queryParam = new Object();
    }
}
exports.EntityObjectSqlite = EntityObjectSqlite;
//# sourceMappingURL=entityObjectSqlite.js.map