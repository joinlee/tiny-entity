"use strict";
var EntityObject = (function () {
    function EntityObject(ctx) {
    }
    EntityObject.prototype.toString = function () { return ""; };
    EntityObject.prototype.clone = function (source, destination, isDeep) { return null; };
    EntityObject.prototype.Where = function (qFn, paramsKey, paramsValue) { return this; };
    EntityObject.prototype.Any = function (qFn, paramsKey, paramsValue, queryCallback) { return null; };
    EntityObject.prototype.First = function (qFn, paramsKey, paramsValue, queryCallback) { return null; };
    EntityObject.prototype.ToList = function (queryCallback) {
        return null;
    };
    EntityObject.prototype.Count = function (qFn, paramsKey, paramsValue, queryCallback) { return null; };
    EntityObject.prototype.OrderBy = function (qFn) { return this; };
    EntityObject.prototype.OrderByDesc = function (qFn) { return this; };
    EntityObject.prototype.Select = function (qFn) { return this; };
    EntityObject.prototype.Take = function (count) { return this; };
    EntityObject.prototype.Skip = function (count) { return this; };
    EntityObject.prototype.Max = function (qFn) { return null; };
    EntityObject.prototype.Min = function (qFn) { return null; };
    EntityObject.prototype.Contains = function (feild, values) { return null; };
    return EntityObject;
}());
exports.EntityObject = EntityObject;
//# sourceMappingURL=entityObject.js.map