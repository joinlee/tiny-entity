export class SeedData {
    static userStr = `{"id":"${new Date().getTime()}","username":"username${new Date().getTime()}","password":"password${new Date().getTime()}","keyWords":["keyWord1","keyWord2","keyWord3${new Date().getTime()}"]}`;

    static articleStr = `{"id":"id${new Date().getTime()}","description":"description${new Date().getTime()}","userId":"userId${new Date().getTime()}","topics":["topics1","topics2","topics3${new Date().getTime()}"],"detail":{"date":"detaildate${new Date().getTime()}","title":"detailtitle${new Date().getTime()}","content":"detailcontent${new Date().getTime()}"}}`;

    static getUser() {
        return JSON.parse(SeedData.userStr);
    }

    static getArticle() {
        return JSON.parse(SeedData.articleStr);
    }
}