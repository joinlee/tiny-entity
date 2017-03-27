"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
function Transaction(ctx) {
    return (target, propertyName, descriptor) => {
        let method = descriptor.value;
        descriptor.value = function () {
            return __awaiter(this, arguments, void 0, function* () {
                this.ctx = ctx;
                console.log("BeginTranscation propertyName:", propertyName);
                ctx.BeginTranscation();
                let result;
                try {
                    result = yield method.apply(this, arguments);
                    ctx.Commit();
                    return result;
                }
                catch (error) {
                    console.log("RollBack propertyName:", propertyName);
                    yield ctx.RollBack();
                    throw error;
                }
            });
        };
    };
}
exports.Transaction = Transaction;
//# sourceMappingURL=transcation.js.map