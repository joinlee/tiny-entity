"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Interpreter {
    constructor(escape, tableName) {
        this.partOfWhere = [];
        this.partOfSelect = "*";
        this.escape = escape;
        this.tableName = tableName;
    }
    TransToSQLOfWhere(func, tableName, paramsKey, paramsValue) {
        let param = this.MakeParams(paramsKey, paramsValue);
        this.partOfWhere.push("(" + this.TransToSQL(func, this.tableName, param) + ")");
        return this.TransToSQL(func, tableName, param);
    }
    TransToSQLOfSelect(func) {
        let r = this.TransToSQL(func, this.tableName);
        this.partOfSelect = r.split('AND').join(',');
        return this.partOfSelect;
    }
    TransToSQLOfJoin(func, foreignTable) {
        let foreignTableName = foreignTable.toString().toLocaleLowerCase();
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
                let indexs = [];
                for (let i = 0; i < funcCharList.length; i++) {
                    let x = funcCharList[i];
                    if (x.indexOf(key) > -1 && x.indexOf("." + key) <= -1) {
                        indexs.push(i);
                    }
                }
                if (indexs && indexs.length) {
                    for (let index of indexs) {
                        funcCharList[index] = funcCharList[index].replace(new RegExp(key, "gm"), this.escape(param[key]));
                    }
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
                if (funcCharList[index - 1] === "=")
                    funcCharList[index - 1] = "IS";
                else if (funcCharList[index - 1] === "!=")
                    funcCharList[index - 1] = "IS NOT";
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