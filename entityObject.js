"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityObject {
    constructor(ctx) { }
    Contains(feild, values, entity) {
        return this;
    }
    Where(qFn, paramsKey, paramsValue, entity) {
        return this;
    }
    On(func, mEntity) {
        return this;
    }
    LeftJoin(fEntity) {
        return this;
    }
    toString() { return ""; }
    clone(source, destination, isDeep) { return null; }
    Join(qFn, entity, mainFeild, isMainTable) { return this; }
    Any(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    First(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    ToList(queryCallback) { return null; }
    Count(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    OrderBy(qFn, entity) { return this; }
    OrderByDesc(qFn, entity) { return this; }
    GroupBy(qFn) { return this; }
    Select(qFn) { return this; }
    Take(count) { return this; }
    Skip(count) { return this; }
    Max(qFn) { return null; }
    Min(qFn) { return null; }
}
exports.EntityObject = EntityObject;
//# sourceMappingURL=entityObject.js.map