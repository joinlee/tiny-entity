import { IJoinQueryObject } from './tinyDB.d';
import { IEntityObject, IDataContext, IQueryObject } from './tinyDB';
export class EntityObject<T extends IEntityObject> implements IEntityObject, IQueryObject<T>, IJoinQueryObject<T>{
    On<F extends IEntityObject>(func: (m: T, f: F) => void): IQueryObject<T>;
    On<M extends IEntityObject, F extends IEntityObject>(func: (m: M, f: F) => void, mEntity: M): IQueryObject<T>;
    On(func: any, mEntity?: any) {
       return this;
    }
    LeftJoin<F extends IEntityObject>(fEntity: F): IJoinQueryObject<T> {
        return this;
    }
    constructor(ctx?: IDataContext) { }
    id: string;
    toString(): string { return ""; }

    /**
      * 克隆复制对象
     * 
     * @param {*} source 目标对象
     * @param {any} destination 目的对象
     * @param {boolean} [isDeep]
     * @returns {T}
     * 
     * @memberOf EntityObject
     */
    clone(source: any, destination, isDeep?: boolean): T { return null; }
    /**
     * 查询，最后通过toList方法提交查询。
     * @param  {(x:T)=>boolean} qFn 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @returns IQueryObject 查询对象
     */
    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]): IQueryObject<T> { return this; }
    /**
     * 左外连接查询
     * 
     * @template K 
     * @param {(x: K) => void} qFn 
     * @param {K} entity 
     * 
     * @memberOf IQueryObject
     */
    Join<K extends IEntityObject>(qFn: (x: K) => void, entity: K, mainFeild?: string, isMainTable?: boolean): IQueryObject<T> { return this; }
    /**
     * 从集合中查找是否有符合匹配的项，存在任何一项返回true，不存在返回false
     * @param  {(entityObject:T)=>boolean} qFn 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @param  {(result:boolean)=>void} queryCallback? 结果回调函数
     * @returns boolean
     */
    Any(qFn: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: boolean) => void): Promise<boolean> { return null; }
    /**
     * 根据查询条件返回第一项结果，存在返回实体对象，不存在返回null
     * @param  {(entityObject:T)=>boolean} qFn? 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @param  {(result:T)=>void} queryCallback?  结果回调函数
     * @returns T
     */
    First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void): Promise<T> { return null; }
    /**
     *  执行查询条件。
     * @param  {(result:T[])=>void} queryCallback? 结果集回调函数
     * @returns T[]
     */
    ToList(queryCallback?: (result: T[]) => void): Promise<T[]> { return null; }
    /**
     * 获取查询结果集中的结果条数
     * @param  {(entityObject:T)=>boolean} qFn? 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @param  {(result:number)=>void} queryCallback? 结果回调函数
     * @returns number
     */
    Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void): Promise<number> { return null; }
    /**
     * 查询排序
     * @param  {(x:T)=>void} qFn 查询条件函数
     * @returns IQueryObject 查询对象
     */
    OrderBy(qFn: (x: T) => any, entity?: IEntityObject): IQueryObject<T> { return this; }
    /**
     * 查询排序，倒序
     * @param  {(x:T)=>void} qFn 查询条件函数
     * @returns IQueryObject 查询对象
     */
    OrderByDesc(qFn: (x: T) => any, entity?: IEntityObject): IQueryObject<T> { return this; }
    GroupBy(qFn: (x: T) => void): IQueryObject<T> { return this; }
    /**
     * 设置需要查询的字段
     * @param  {(x:T)=>void} qFn 查询条件函数
     * @returns IQueryObject 查询对象
     */
    Select(qFn: (x: T) => void): IQueryObject<T> { return this; }
    /**
     * 获取的结果条数
     * @param  {number} count 获取的数目
     * @returns IQueryObject 查询对象
     */
    Take(count: number) { return this; }
    /**
     * 跳过的结果条数
     * @param  {number} count 跳过查询的数目
     * @returns IQueryObject 查询对象
     */
    Skip(count: number): IQueryObject<T> { return this; }
    Max(qFn: (x: T) => void): Promise<number> { return null; }
    Min(qFn: (x: T) => void): Promise<number> { return null; }
    Contains(feild: (x: T) => void, values: any[]): IQueryObject<T> { return this; }
}