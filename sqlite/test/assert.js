"use strict";
class Assert {
    static IsTrue(value) {
        if (value && value == true)
            return true;
        else
            throw "断言失败！";
    }
}
exports.Assert = Assert;
//# sourceMappingURL=assert.js.map