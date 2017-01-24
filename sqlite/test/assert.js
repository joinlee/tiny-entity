"use strict";
var Assert = (function () {
    function Assert() {
    }
    Assert.IsTrue = function (value) {
        if (value && value == true)
            return true;
        else
            throw "断言失败！";
    };
    return Assert;
}());
exports.Assert = Assert;
//# sourceMappingURL=assert.js.map