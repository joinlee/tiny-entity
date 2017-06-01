import { QueryMode } from './dataContextNeDB';
import { EntityObject } from "../entityObject";
import { IQueryObject, IDataContext, IEntityObject } from '../tinyDB';

export class EntityObjectNeDB<T extends IEntityObject> extends EntityObject<T>{
    id: string;
    toString(): string { return ""; }

    private ctx: IDataContext;
    private sqlTemp: { qFn: any[]; queryMode?: QueryMode; inq?: any } = <any>{
        qFn: []
    };
    private queryParam: QueryParams = new Object() as QueryParams;
    private joinParams: any[];
    constructor(ctx?: IDataContext) {
        super(ctx);
        this.ctx = ctx;
    }

    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]) {
        this.sqlTemp.qFn.push(qFn);
        return this;
    }
    Join<K extends IEntityObject>(qFn: (x: K) => void, entity: K) {
        this.joinParams || (this.joinParams = []);
        let feild = this.formateCode(qFn);
        let joinTableName = entity.toString();
        let mainTableName = this.toString();
        if (this.joinParams.length > 1) {
            mainTableName = this.joinParams[this.joinParams.length - 1].joinTableName;
        }
        this.joinParams.push({
            joinTableName: joinTableName,
            joinSelectFeild: feild,
            mainTableName: mainTableName
        });
        return this;
    }
    Select(qFn: (x: T) => void) {
        return this;
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
    Take(count: number) {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count: number) {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn: (x: T) => void, entity?: T) {
        this.queryParam.OrderByFeildName = this.getFeild(qFn);
        this.queryParam.OrderByTableName = entity.toString();
        return this;
    }
    OrderByDesc(qFn: (x: T) => void, entity?: T) {
        this.queryParam.IsDesc = true;
        this.OrderBy(qFn, entity);
        return this;
    }
    GroupBy(qFn: (x: T) => void) {
        this.queryParam.GroupByFeildName = this.getFeild(qFn);
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
        let r: any[];
        if (this.sqlTemp.qFn.length > 0) {
            if (this.HasJoin()) {
                let mainResultList = await this.ctx.Query(this.sqlTemp.qFn, this.toString(), this.sqlTemp.queryMode, null, this.sqlTemp.inq);
                r = await this.GenerateJoinResult(mainResultList, []);
            }
            else {
                r = await this.ctx.Query(this.sqlTemp.qFn, this.toString(), this.sqlTemp.queryMode, null, this.sqlTemp.inq);
            }
        }
        else {
            if (this.HasJoin()) {
                let mainResultList = await this.ctx.Query([x => true], this.toString());
                r = await this.GenerateJoinResult(mainResultList);
            }
            else {
                r = await this.ctx.Query([x => true], this.toString());
            }
        }
        //将this.sqlTemp置为空
        this.sqlTemp = {
            qFn: []
        }

        let result = (this.cloneList(r) as T[]);
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
                    })
                }
                else {
                    result = result.sort((a, b) => {
                        if (hasJoin) {
                            return a[orderByTableName][orderByFiled] - b[orderByTableName][orderByFiled];
                        }
                        else {
                            return a[orderByFiled] - b[orderByFiled];
                        }
                    })
                };
                this.queryParam.OrderByFeildName = null;
                this.queryParam.IsDesc = null;
            }
            if (this.queryParam.GroupByFeildName) {
                let temp_r: { key: string; value: any }[] = [];
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
    }
    private async GenerateJoinResult(mainResultList, newRows: any[], joinParsamsIndex?: number) {
        if (joinParsamsIndex == null || joinParsamsIndex == undefined) joinParsamsIndex = 0;
        if (joinParsamsIndex >= this.joinParams.length) return null;
        let joinParamsItem = this.joinParams[joinParsamsIndex];
        let newJoinParamsIndex = joinParsamsIndex++;

        // let newRows = [];
        for (let mrItem of mainResultList) {
            let leftResultResult = await this.ctx.Query((x) => { return x[joinParamsItem.joinSelectFeild] == mrItem.id }, joinParamsItem.joinTableName);
            let r = await this.GenerateJoinResult(leftResultResult, newRows, newJoinParamsIndex);
            if (leftResultResult.length == 0) {
                let newRowItem = {};
                let currentTableName = joinParamsItem.mainTableName.toLocaleLowerCase();
                newRowItem[currentTableName] || (newRowItem[currentTableName] = {
                    toString: function () { return currentTableName; }
                });
                newRowItem[currentTableName] = mrItem;

                let joinTableName = joinParamsItem.joinTableName.toLocaleLowerCase();
                newRowItem[joinTableName] || (newRowItem[joinTableName] = {
                    toString: function () { return joinParamsItem.joinTableName; }
                });
                newRowItem[joinTableName] = null;

                newRows.push(newRowItem);
            }
            else {
                for (let lrItem of leftResultResult) {
                    let newRowItem = {};
                    let currentTableName = this.toString().toLocaleLowerCase();
                    newRowItem[currentTableName] || (newRowItem[currentTableName] = {
                        toString: function () { return currentTableName; }
                    });
                    newRowItem[currentTableName] = mrItem;

                    let joinTableName = joinParamsItem.joinTableName.toLocaleLowerCase();
                    newRowItem[joinTableName] || (newRowItem[joinTableName] = {
                        toString: function () { return joinParamsItem.joinTableName; }
                    });
                    newRowItem[joinTableName] = lrItem;

                    newRows.push(newRowItem);
                }
            }

        }

        return newRows;
    }
    private HasJoin() {
        return this.joinParams && this.joinParams.length > 0;
    }

    async Max(qFn: (x: T) => void): Promise<number> {
        let feild = this.getFeild(qFn);
        let r = await this.OrderByDesc(qFn).ToList();
        if (r && r.length > 0) return <any>r[0];
        else return null;
    }
    async Min(qFn: (x: T) => void): Promise<number> {
        let feild = this.getFeild(qFn);
        let r = await this.OrderBy(qFn).ToList();
        if (r && r.length > 0) return <any>r[0];
        else return null;
    }
    Contains(feild: (x: T) => void, values: string[]) {
        let inq = {
            feildName: this.getFeild(feild),
            value: values
        };
        this.sqlTemp.qFn = [() => true];
        this.sqlTemp.queryMode = QueryMode.Contains;
        this.sqlTemp.inq = inq;
        return this;
        //return this.ctx.Query(null, this.toString(), QueryMode.Contains, null, inq);
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
    private formateCode(qFn): string {
        let qFnS: string = qFn.toString();
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
        //p是参数
        let p: string = this.getParameterNames(qFn)[0];
        qFnS = qFnS.substring(p.length, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "");


        return qFnS;
    }
    private getParameterNames(fn) {
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
    OrderByFeildName: string;
    OrderByTableName: string;
    IsDesc: boolean;
    SelectFileds: string[];
    GroupByFeildName: string;
}
