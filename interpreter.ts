export class Interpreter {
    private escape: any;
    constructor(escape) {
        this.escape = escape;
    }

    formateCode(qFn, tableName?: string, paramsKey?: string[], paramsValue?: any[]): string {
        let param = this.MakeParams(paramsKey, paramsValue);
        return this.TransToSQL(qFn, tableName, param);

        // let qFnS: string = qFn.toString();
        // qFnS = qFnS.replace(/function/g, "");
        // qFnS = qFnS.replace(/return/g, "");
        // qFnS = qFnS.replace(/if/g, "");
        // qFnS = qFnS.replace(/else/g, "");
        // qFnS = qFnS.replace(/true/g, "");
        // qFnS = qFnS.replace(/false/g, "");
        // qFnS = qFnS.replace(/\{/g, "");
        // qFnS = qFnS.replace(/\}/g, "");
        // qFnS = qFnS.replace(/\(/g, "");
        // qFnS = qFnS.replace(/\)/g, "");
        // qFnS = qFnS.replace(/\;/g, "");
        // qFnS = qFnS.replace(/=>/g, "");
        // qFnS = qFnS.trim();
        // //p是参数
        // let p: string = this.getParameterNames(qFn)[0];
        // qFnS = qFnS.substring(p.length, qFnS.length);
        // qFnS = qFnS.trim();
        // if (tableName)
        //     qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "`" + tableName + "`.");
        // else
        //     qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "");

        // let indexOfFlag = qFnS.indexOf(".IndexOf") > -1;
        // qFnS = qFnS.replace(new RegExp("\\.IndexOf", "gm"), " LIKE ");

        // qFnS = qFnS.replace(/\&\&/g, "AND");
        // qFnS = qFnS.replace(/\|\|/g, "OR");
        // qFnS = qFnS.replace(/\=\=/g, "=");

        // if (paramsKey && paramsValue) {
        //     qFnS = qFnS.replace(new RegExp("= null", "gm"), "IS NULL");
        //     if (paramsKey.length != paramsValue.length) throw 'paramsKey,paramsValue 参数异常';
        //     for (let i = 0; i < paramsKey.length; i++) {
        //         let v = paramsValue[i];
        //         if (indexOfFlag) {
        //             let xx = this.escape(paramsValue[i]);
        //             xx = xx.substring(1, xx.length - 1);
        //             v = "LIKE '%" + xx + "%'";
        //             qFnS = qFnS.replace(new RegExp("LIKE " + paramsKey[i], "gm"), v);
        //         }
        //         else {
        //             let opchar = qFnS[qFnS.lastIndexOf(paramsKey[i]) - 2];
        //             if (isNaN(v)) v = opchar + " " + this.escape(paramsValue[i]);
        //             else v = opchar + " " + this.escape(paramsValue[i]);

        //             if (paramsValue[i] === "" || paramsValue[i] === null || paramsValue[i] === undefined) {
        //                 v = "IS NULL";
        //             }
        //             qFnS = qFnS.replace(new RegExp(opchar + " " + paramsKey[i], "gm"), v);
        //         }
        //     }
        // }
        // else {
        //     qFnS = qFnS.replace(new RegExp("= null", "gm"), "IS NULL");
        //     if (indexOfFlag) {
        //         let s = qFnS.split(" ");
        //         let sIndex = s.findIndex(x => x === "LIKE");
        //         if (sIndex) {
        //             let sStr = s[sIndex + 1];
        //             sStr = sStr.substring(1, sStr.length - 1);
        //             sStr = this.escape(sStr);
        //             sStr = sStr.substring(1, sStr.length - 1);
        //             s[sIndex + 1] = "'%" + sStr + "%'";
        //             qFnS = s.join(' ');
        //         }
        //     }
        // }
        // return qFnS;
    }

    private getParameterNames(fn) {
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

    TransToSQL(func: Function, tableName?: string, param?: any): string {
        let funcStr = func.toString();
        let funcCharList = funcStr.split(" ");
        funcCharList = this.ReplaceParam(funcCharList, param);
        funcCharList = this.GetQueryCharList(funcCharList, tableName);

        return funcCharList.join(" ");
    }

    private ReplaceParam(funcCharList: string[], param): string[] {
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

    private GetQueryCharList(funcCharList: string[], tableName: string): string[] {
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

            if (item === "==") funcCharList[index] = "=";
            if (item === "&&") funcCharList[index] = "AND";
            if (item === "||") funcCharList[index] = "OR";
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

    private MakeParams(paramsKey: string[], paramsValue: any[]) {
        if (paramsKey && paramsValue) {
            let p: any = {};
            for (let i = 0; i < paramsKey.length; i++) {
                p[paramsKey[i]] = paramsValue[i];
            }
            return p;
        }
        else return null;
    }

}