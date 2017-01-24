"use strict";
var EntityCopier = (function () {
    function EntityCopier() {
    }
    EntityCopier.Copy = function (s, d) {
        delete d.sqlTemp;
        delete d.ctx;
        delete d.queryParam;
        for (var key in d) {
            if (s[key] == undefined || s[key] == null)
                continue;
            if (typeof (s[key]) != "function")
                d[key] = s[key];
            if (s[key] instanceof Date) {
                d[key] = s[key];
            }
            else if (typeof (s[key]) == "object") {
                d[key] = JSON.stringify(s[key]);
            }
        }
        return d;
    };
    EntityCopier.Decode = function (s) {
        delete s.sqlTemp;
        delete s.ctx;
        delete s.queryParam;
        for (var key in s) {
            try {
                var d = JSON.parse(s[key]);
                if (isNaN(d) || Array.isArray(d)) {
                    s[key] = d;
                }
            }
            catch (err) { }
        }
        return s;
    };
    return EntityCopier;
}());
exports.EntityCopier = EntityCopier;
//# sourceMappingURL=entityCopier.js.map