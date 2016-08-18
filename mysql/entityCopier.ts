export class EntityCopier {
    static Copy<T>(s: any, d: T): T {
        delete (<any>d).sqlTemp;
        delete (<any>d).ctx;
        delete (<any>d).queryParam;

        for (let key in d) {
            if(!s[key]) continue;
            if (typeof (s[key]) != "function")
                d[key] = s[key];
            if (typeof (s[key]) == "object") {
                d[key] = JSON.stringify(s[key]);
            }
        }
        return d;
    }
}