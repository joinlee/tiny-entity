export class Interpreter {
    private escape: any;
    private tableName: string;
    private partOfWhere: string[] = [];
    private partOfSelect: string = "*";
    constructor(escape, tableName) {
        this.escape = escape;
        this.tableName = tableName;
    }

    TransToSQLOfWhere(func: Function, tableName?: string, paramsKey?: string[], paramsValue?: any[]): string {
        let param = this.MakeParams(paramsKey, paramsValue);
        // add to sql part of where;
        this.partOfWhere.push("(" + this.TransToSQL(func, this.tableName, param) + ")");
        return this.TransToSQL(func, tableName, param);
    }

    TransToSQLOfSelect(func: Function) {
        let r = this.TransToSQL(func, this.tableName);
        // add to sql part of select
        this.partOfSelect = r.split('AND').join(',');
        console.log("rrrrrrrrrrrrrrrr", this.partOfSelect, this.partOfWhere);

        return this.partOfSelect;
    }

    TransToSQLOfJoin(func: Function, foreignTable: any) {
        let foreignTableName = foreignTable.toString().toLocaleLowerCase();

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
                if(funcCharList[index - 1] === "==") funcCharList[index - 1] = "IS";
                else if(funcCharList[index - 1] === "!=") funcCharList[index - 1] = "IS NOT";
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