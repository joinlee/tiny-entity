"use strict";
class EntityCopier {
    static Copy(s, d) {
        delete d.sqlTemp;
        delete d.ctx;
        delete d.queryParam;
        for (let key in d) {
            if (!s[key])
                continue;
            if (typeof (s[key]) != "function")
                d[key] = s[key];
            if (typeof (s[key]) == "object") {
                d[key] = JSON.stringify(s[key]);
            }
        }
        return d;
    }
}
exports.EntityCopier = EntityCopier;
//# sourceMappingURL=entityCopier.js.map