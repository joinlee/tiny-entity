export class seedData {
    static userStr = `{"id":"${new Date().getTime()}","username":"username${new Date().getTime()}","password":"password${new Date().getTime()}","keyWords":["keyWord1","keyWord2","keyWord3${new Date().getTime()}"]}`;

    static articleStr = `{"id":"${new Date().getTime()}","description":"description${new Date().getTime()}","userId":"${new Date().getTime()}","content":{"date":"${new Date().getTime()}","title":"title${new Date().getTime()}","content":"content${new Date().getTime()}content${new Date().getTime()}"}`;

    static getUser() {
        return JSON.parse(seedData.userStr);
    }

    static getArticle() {
        return JSON.parse(seedData.articleStr);
    }
}