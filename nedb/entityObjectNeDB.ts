import { QueryMode } from './dataContextNeDB';
import { EntityObject } from "../entityObject";
import { IQueryObject, IDataContext, IEntityObject } from '../tinyDB';

export class EntityObjectNeDB<T extends IEntityObject> extends EntityObject<T>{
    id: string;
    toString(): string { return ""; }

    private ctx: IDataContext;
    private sqlTemp = [];
    private queryParam: QueryParams = new Object() as QueryParams;
    constructor(ctx?: IDataContext) {
        super(ctx);
        this.ctx = ctx;
    }

    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]): IQueryObject<T> {
        this.sqlTemp.push(qFn);
        return this;
    }
    Select(qFn: (x: T) => void): IQueryObject<T> {
        return null;
    }
    async Any(qFn: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: boolean) => void) {
        let r = await this.First(qFn)
        return r ? true : false;
    }
    async Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void) {
        let p = [];
        if (qFn) p.push(qFn);
        else p = null;
        let r: number = await this.ctx.Query(<any>p, this.toString(), QueryMode.Count);
        return r;
    }
    async First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void) {
        let r: T = await this.ctx.Query([qFn], this.toString(), QueryMode.First);
        return this.clone(r, new Object() as T) as T;
    }
    Take(count: number): IQueryObject<T> {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count: number): IQueryObject<T> {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn: (x: T) => void): IQueryObject<T> {
        this.queryParam.OrderByFiledName = this.getFeild(qFn);
        return this;
    }
    OrderByDesc(qFn: (x: T) => void): IQueryObject<T> {
        this.queryParam.IsDesc = true;
        this.OrderBy(qFn);
        return this;
    }
    async Sum(qFn: (x: T) => void) {
        let feild = this.getFeild(qFn);
        let r = await this.ToList();
        let result: number = 0;
        r.forEach((x: any) => result += x[feild]);

        return result;
    }
    async ToList(queryCallback?: (result: T[]) => void) {
        let r: [any];
        if (this.sqlTemp.length > 0) {
            r = await this.ctx.Query(this.sqlTemp as any, this.toString());
        }
        else {
            r = await this.ctx.Query([x => true], this.toString());
        }
        //将this.sqlTemp置为空
        this.sqlTemp = [];
        let result = (this.cloneList(r) as T[]);
        if (this.queryParam) {
            if (this.queryParam.OrderByFiledName) {
                let orderByFiled = this.queryParam.OrderByFiledName;
                if (this.queryParam.IsDesc) {
                    result = result.sort((a, b) => {
                        return b[orderByFiled] - a[orderByFiled];
                    })
                }
                else {
                    result = result.sort((a, b) => {
                        return a[orderByFiled] - b[orderByFiled];
                    })
                };
                this.queryParam.OrderByFiledName = null;
                this.queryParam.IsDesc = null;
            }
            if (this.queryParam.TakeCount) {
                result = result.splice(0, this.queryParam.TakeCount);
                this.queryParam.TakeCount = null;
            }
            if (this.queryParam.SkipCount) {
                result = result.splice(this.queryParam.SkipCount, result.length);
                this.queryParam.SkipCount = null;
            }
        }
        return result;
    }
    async Max(qFn: (x: T) => void) {
        let feild = this.getFeild(qFn);
        let r = await this.OrderByDesc(qFn).ToList();
        if (r && r.length > 0) return r[0];
        else return null;
    }
    async Min(qFn: (x: T) => void) {
        let feild = this.getFeild(qFn);
        let r = await this.OrderBy(qFn).ToList();
        if (r && r.length > 0) return r[0];
        else return null;
    }
    Contains(feild: (x: T) => void, values: string[]) {
        let inq = {
            feildName: this.getFeild(feild),
            value: values
        };
        return this.ctx.Query(null, this.toString(), QueryMode.Contains, null, inq);
    }


    clone(source: any, destination: T, isDeep?: boolean): T {
        if (!source) return null;

        destination = source;
        delete (destination as any).sqlTemp;
        delete (destination as any).queryParam;
        delete (destination as any)._id;
        delete (destination as any).ctx;
        destination.toString = this.toString;
        return destination;
    }
    cloneList(list: any[]): T[] {
        let r: T[] = [];
        list.forEach(x => {
            if (x) r.push(this.clone(x, new Object() as T, false));
        });

        return r;
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
                if (isNaN) v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
            }
        }

        return qFnS;
    }
    private getFeild(qFn): string {
        let qFns = this.formateCode(qFn);
        qFns = qFns.replace(/=>/g, "");
        let qList = qFns.split(".");
        if (qList.length > 2) throw "解析出错： getFeild(qFn): string";
        return qList[1];
    }
}

interface QueryParams {
    TakeCount: number;
    SkipCount: number;
    OrderByFiledName: string;
    IsDesc: boolean;
    SelectFileds: string[];
}