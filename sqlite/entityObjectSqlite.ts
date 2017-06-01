import { EntityCopier } from './../entityCopier';
import { SqliteDataContext } from './dataContextSqlite';
import { EntityObject } from '../entityObject';
import { IEntityObject, IQueryObject } from '../tinyDB';
/**
 * EntityObject
 */
class EntityObjectSqlite<T extends IEntityObject> extends EntityObject<T>{
    Contains(feild: (x: T) => void, values: any[]) {
        return this;
    }
    id: string;
    toString(): string { return ""; }
    private ctx: SqliteDataContext;
    private sqlTemp = [];
    private queryParam: QueryParams = new Object() as QueryParams;
    constructor(ctx?: SqliteDataContext) {
        super(ctx);
        this.ctx = ctx;
    }
    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]) {
        let sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        this.sqlTemp.push(sql);
        return this;
    }
    Join<K extends IEntityObject>(entity: K, qFn: (x: K) => void) {
        return this;
    }
    Select(qFn: (x: T) => void) {
        let filed = this.formateCode(qFn);
        this.queryParam.SelectFileds = filed.split("AND");
        return this;
    }
    async Any(qFn: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: boolean) => void): Promise<boolean> {
        let result = await this.Count(qFn, paramsKey, paramsValue, (queryCallback as any));
        return result > 0;
    }
    Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void): Promise<number> {
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
    First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void): Promise<T> {
        let sql: string;
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
            resolve(this.clone(EntityCopier.Decode(row && row['0']), new Object() as T));
        });
    }
    Take(count: number) {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count: number) {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn: (x: T) => void) {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    }
    OrderByDesc(qFn: (x: T) => void) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    }
    ToList(queryCallback?: (result: T[]) => void): Promise<T[]> {
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
        })
    }
    Max(qFn: (x: T) => void) {
        return null;
    }
    Min(qFn: (x: T) => void) {
        return null;
    }
    private formateCode(qFn, paramsKey?: string[], paramsValue?: any[]): string {
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
        let p: string = qFnS[0];

        qFnS = qFnS.substring(1, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p, "gm"), this.toString());
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");

        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length) throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (isNaN(v)) v = "= '" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp("= " + paramsKey[i], "gm"), v);
            }
        }

        return qFnS;
    }
    clone(source: any, destination: T, isDeep?: boolean): T {
        if (!source) return null;
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
    private cloneList(list: [any]): T[] {
        let r: T[] = [];
        list.forEach(x => {
            if (x) r.push(this.clone(EntityCopier.Decode(x), new Object() as T, false));
        });

        return r;
    }
    private addQueryStence(sql: string): string {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDER BY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc) sql += " DESC";
        }
        if (this.queryParam.TakeCount && this.queryParam.SkipCount) {
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    }
    private clearQueryParams(): void {
        this.queryParam = new Object() as QueryParams;
    }
}

interface QueryParams {
    TakeCount: number;
    SkipCount: number;
    OrderByFiledName: string;
    IsDesc: boolean;
    SelectFileds: string[];
}

export { EntityObjectSqlite }