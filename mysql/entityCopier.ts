export class EntityCopier {
    static Copy<T>(s: any, d: T): T {
        delete (<any>d).sqlTemp;
        delete (<any>d).ctx;
        delete (<any>d).queryParam;

        for (let key in d) {
            if (s[key] == undefined || s[key] == null) continue;
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
    }

    static Decode<T>(s: any) {
        delete (<any>s).sqlTemp;
        delete (<any>s).ctx;
        delete (<any>s).queryParam;

        for (let key in s) {
            try {
                let d = JSON.parse(s[key]);
                if (isNaN(d) || d instanceof Array) {
                    s[key] = d;
                }
            }
            catch (err) { }
        }

        return s;
    }
}