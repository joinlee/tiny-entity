"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Interpreter {
    constructor(escape) {
        this.escape = escape;
    }
    formateCode(qFn, tableName, paramsKey, paramsValue) {
        let param = this.MakeParams(paramsKey, paramsValue);
        return this.TransToSQL(qFn, tableName, param);
    }
    getParameterNames(fn) {
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
    TransToSQL(func, tableName, param) {
        let funcStr = func.toString();
        let funcCharList = funcStr.split(" ");
        funcCharList = this.ReplaceParam(funcCharList, param);
        funcCharList = this.GetQueryCharList(funcCharList, tableName);
        return funcCharList.join(" ");
    }
    ReplaceParam(funcCharList, param) {
        if (param) {
            for (let key in param) {
                let index = funcCharList.findIndex(x => x.indexOf(key) > -1 && x.indexOf("." + key) <= -1);
                if (index) {
                    funcCharList[index] = funcCharList[index].replace(new RegExp(key, "gm"), this.escape(param[key]));
                }
            }
        }
        return funcCharList;
    }
    GetQueryCharList(funcCharList, tableName) {
        let fChar = funcCharList[0];
        if (tableName)
            tableName = tableName.toLocaleLowerCase();
        for (let index = 0; index < funcCharList.length; index++) {
            let item = funcCharList[index];
            if (item.indexOf(fChar + ".") > -1) {
                if (tableName)
                    funcCharList[index] = funcCharList[index].replace(new RegExp(fChar + "\\.", "gm"), "`" + tableName + "`.");
                else
                    funcCharList[index] = funcCharList[index].replace(new RegExp(fChar + "\\.", "gm"), "");
            }
            if (item === "==")
                funcCharList[index] = "=";
            if (item === "&&")
                funcCharList[index] = "AND";
            if (item === "||")
                funcCharList[index] = "OR";
            if (item.toLocaleLowerCase() == "null") {
                funcCharList[index - 1] = "IS";
                funcCharList[index] = "NULL";
            }
            if (item.indexOf(".IndexOf") > -1) {
                funcCharList[index] = funcCharList[index].replace(new RegExp("\\.IndexOf", "gm"), " LIKE ");
                funcCharList[index] = funcCharList[index].replace(/\(\"/g, '"%');
                funcCharList[index] = funcCharList[index].replace(/\"\)/g, '%"');
                funcCharList[index] = funcCharList[index].replace(/\(\'/g, '"%');
                funcCharList[index] = funcCharList[index].replace(/\'\)/g, '%"');
            }
        }
        funcCharList.splice(0, 1);
        funcCharList.splice(0, 1);
        return funcCharList;
    }
    MakeParams(paramsKey, paramsValue) {
        if (paramsKey && paramsValue) {
            let p = {};
            for (let i = 0; i < paramsKey.length; i++) {
                p[paramsKey[i]] = paramsValue[i];
            }
            return p;
        }
        else
            return null;
    }
}
exports.Interpreter = Interpreter;
//# sourceMappingURL=interpreter.js.map