webpackJsonp(["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports) {

module.exports = ".subbed-in {\n    height: 100%;\n    border-radius: 3px;\n    background: black;\n    display: inline-block;\n    color: white;\n    font-size: 15px;\n}\n\n.player-name {\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    vertical-align: top;\n    font-size: 14px;\n    width: 10%;\n    margin-right: 1%;\n    height: 100%;\n    display: inline-block;\n    text-align: right;\n}\n\n.main {\n    position: relative;\n    width: 96%;\n    margin: 0 2%;\n    font-size: 0;\n}\n\n.player {\n    margin-bottom: 3px;\n    height: 20px;\n}\n\n.header {\n    height: 20px;\n}\n\n.period-header {\n    display: inline-block;\n    height: 20px;\n    /* border-left: 1px solid black; */\n    font-size: 15px;\n    vertical-align: top;\n}\n\n.scoreboard {\n    text-align: center;\n    height: 170px;\n    margin-bottom: 5px;\n}\n\n.score {\n    font-size: 70px;\n    display: inline-block;\n    vertical-align: top;\n    margin-top: 45px;\n}\n\n.team-logo {\n    height: 100%;\n}\n\n.period-line {\n    width: 2px;\n    background-color: grey;\n    position: absolute;\n    z-index: -1;\n}\n\n.team-divisor {\n    height: 30px;\n    width: 100%;\n}\n\n.score-chart {\n    opacity: 0.6;\n    position: absolute;\n    width: 100%;\n}\n\n.score-bar {\n    display: inline-block;\n}"

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"main\">\n\n    <div class=\"scoreboard\">\n        <span class=\"score\">{{homeScore}}</span>\n        <img class=\"team-logo\" [src]=\"homeTeam ? '../assets/logos/' + homeTeam + '.svg' : ''\">\n        <img class=\"team-logo\" [src]=\"visitingTeam ? '../assets/logos/' + visitingTeam + '.svg': ''\">\n        <span class=\"score\">{{visitingScore}}</span>\n    </div>\n\n    <div class=\"header\">\n        <span class=\"player-name\"></span>\n        <ng-container *ngFor=\"let period of allPeriods\">\n            <span\n                *ngIf=\"period <= 4\"\n                class=\"period-header\"\n                [style.width.%]=\"88/totalGameTime*(12*60)\">\n                    Q{{period}}\n            </span>\n            <span\n                *ngIf=\"period > 4\"\n                class=\"period-header\"\n                [style.width.%]=\"88/totalGameTime*(5*60)\"\n            >\n                OT{{period-4}}\n            </span>\n        </ng-container>\n    </div>\n\n    <div class=\"data\">\n        <div\n            *ngFor=\"let period of allPeriods\"\n            class=\"period-line\"\n            [style.height.px]=\"(playerIds[0].length+playerIds[1].length)*23 + 27\"\n            [style.left.%]=\"11 + 88/totalGameTime*periodStartTime(period)\">\n        </div>\n        <div\n            class=\"score-chart\"\n            [style.margin-top.px]=\"23*playerIds[0].length - 100 + 15\">\n            <div class=\"player-name\"></div>\n            <ng-container *ngFor=\"let score of scores; let i = index\">\n                <span\n                    [class]=\"'score-bar' + ' ' + ( score.differential > 0 ? homeTeam : visitingTeam)\"\n                    [style.height.px]=\"score.differential < 0 ? score.differential*-10 : score.differential*10\"\n                    [style.width.%]=\"i+1 !== scores.length ? (scores[i+1].time-score.time)/totalGameTime*88 : 0\"\n                    [style.margin-bottom.px]=\"score.differential < 0 ? score.differential*10 : 0\"\n                    [style.border-radius]=\"score.differential < 0 ? '0px 0px 2px 2px' : '2px 2px 0px 0px'\"\n                >\n            </span>\n            </ng-container>\n        </div>\n        <div *ngFor=\"let teamIds of playerIds\">\n            <div *ngFor=\"let playerId of teamIds\" class=\"player\">\n                <span class=\"player-name\">\n                    {{players[playerId].firstName + ' ' + players[playerId].lastName}}\n                </span>\n                <ng-container *ngFor=\"let rotation of players[playerId].rotations\">\n                    <span class=\"subbed-in\"\n                        [style.width.%]=\"(rotation.endTime - rotation.startTime)/totalGameTime*88\"\n                        [style.visibility]=\"rotation.inGame ? 'visible' : 'hidden'\">\n                    </span>\n                </ng-container>\n            </div>\n            <div *ngIf=\"playerIds.indexOf(teamIds)===0\" class=\"team-divisor\"></div>\n        </div>\n    </div>\n\n    <div class=\"header\">\n        <span class=\"player-name\"></span>\n        <ng-container *ngFor=\"let period of allPeriods\">\n            <span\n                *ngIf=\"period <= 4\"\n                class=\"period-header\"\n                [style.width.%]=\"88/totalGameTime*(12*60)\">\n                    Q{{period}}\n            </span>\n            <span\n                *ngIf=\"period > 4\"\n                class=\"period-header\"\n                [style.width.%]=\"88/totalGameTime*(5*60)\"\n            >\n                OT{{period-4}}\n            </span>\n        </ng-container>\n    </div>\n</div>\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__("./node_modules/@angular/common/esm5/http.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppComponent = /** @class */ (function () {
    function AppComponent(http) {
        var _this = this;
        this.http = http;
        this.playerIds = [[], []];
        this.period = 1;
        this.allPeriods = [1, 2, 3, 4];
        this.players = new Map();
        this.totalGameTime = this.periodStartTime(4 + 1);
        this.scores = [new ScoreDifferential(0, 0)];
        this.getGameDetails().subscribe(function (data) {
            var totalPeriods = data['g']['p'];
            for (var i = 5; i <= totalPeriods; ++i) {
                _this.allPeriods.push(i);
            }
            _this.totalGameTime = _this.periodStartTime(totalPeriods + 1);
            _this.homeTeam = data['g']['hls']['ta'];
            _this.homeScore = data['g']['hls']['s'];
            _this.visitingTeam = data['g']['vls']['ta'];
            _this.visitingScore = data['g']['vls']['s'];
            _this.parseRoster(data['g']['hls']['pstsg'], _this.homeTeam);
            _this.parseRoster(data['g']['vls']['pstsg'], _this.visitingTeam);
        });
        this.getPbp().subscribe(function (data) {
            // bugged if you play a whole period without subbing and without game activity
            for (var _i = 0, _a = data['g']['pd']; _i < _a.length; _i++) {
                var period = _a[_i];
                for (var _b = 0, _c = period['pla']; _b < _c.length; _b++) {
                    var event_1 = _c[_b];
                    if (event_1['etype'] === 8) {
                        var playerInId = event_1['epid'];
                        var playerOutId = event_1['pid'];
                        var seconds = _this.clockToSecondsElapsed(event_1['cl']);
                        // substitute IN
                        _this.players[playerInId].rotations[_this.players[playerInId].rotations.length - 1].inGame = false;
                        _this.players[playerInId].rotations[_this.players[playerInId].rotations.length - 1].endTime = seconds;
                        _this.players[playerInId].rotations.push(new Rotation(true, seconds));
                        // subsitute OUT
                        _this.players[playerOutId].rotations[_this.players[playerOutId].rotations.length - 1].inGame = true;
                        _this.players[playerOutId].rotations[_this.players[playerOutId].rotations.length - 1].endTime = seconds;
                        _this.players[playerOutId].rotations.push(new Rotation(false, seconds));
                    }
                    else if (event_1['etype'] === 13) {
                        ++_this.period;
                        for (var _d = 0, _e = Object.keys(_this.players); _d < _e.length; _d++) {
                            var id = _e[_d];
                            _this.players[id].rotations[_this.players[id].rotations.length - 1].endTime = _this.periodStartTime(_this.period);
                            _this.players[id].rotations.push(new Rotation(false, _this.periodStartTime(_this.period)));
                        }
                    }
                    else if (event_1['etype'] === 0) {
                        for (var _f = 0, _g = Object.keys(_this.players); _f < _g.length; _f++) {
                            var id = _g[_f];
                            _this.players[id].rotations.pop();
                        }
                    }
                    else {
                        if (event_1['etype'] === 1 || event_1['etype'] == 3) {
                            _this.scores.push(new ScoreDifferential(event_1['hs'] - event_1['vs'], _this.clockToSecondsElapsed(event_1['cl'])));
                        }
                        var pid = event_1['pid'];
                        var epid = event_1['epid'];
                        if (_this.players[pid]) {
                            _this.players[pid].rotations[_this.players[pid].rotations.length - 1].inGame = true;
                        }
                        if (_this.players[epid]) {
                            _this.players[epid].rotations[_this.players[epid].rotations.length - 1].inGame = true;
                        }
                    }
                }
            }
            // merge continous play over quarters
            for (var _h = 0, _j = Object.keys(_this.players); _h < _j.length; _h++) {
                var id = _j[_h];
                var i = 0;
                while (i < _this.players[id].rotations.length - 1) {
                    if (_this.players[id].rotations[i].inGame === _this.players[id].rotations[i + 1].inGame) {
                        _this.players[id].rotations[i].endTime = _this.players[id].rotations[i + 1].endTime;
                        _this.players[id].rotations.splice(i + 1, 1);
                    }
                    else {
                        ++i;
                    }
                }
            }
        });
    }
    AppComponent.prototype.periodStartTime = function (period) {
        if (period <= 4) {
            return 60 * 12 * (period - 1);
        }
        else {
            return 60 * 12 * 4 + 60 * 5 * (period - 5);
        }
    };
    AppComponent.prototype.clockToSecondsElapsed = function (clock) {
        // XX:XX to seconds
        return this.periodStartTime(this.period + 1) - (parseInt(clock.substring(0, 2)) * 60 + parseInt(clock.substring(3, 5)));
    };
    AppComponent.prototype.parseRoster = function (rosterJson, team) {
        for (var _i = 0, rosterJson_1 = rosterJson; _i < rosterJson_1.length; _i++) {
            var player = rosterJson_1[_i];
            if (player['min']) {
                if (team === this.homeTeam) {
                    this.playerIds[0].push(player['pid']);
                }
                else {
                    this.playerIds[1].push(player['pid']);
                }
                this.players[player['pid']] = new Player(player['fn'], player['ln'], team, [new Rotation(player['court'] === 1, 0)]);
            }
        }
    };
    AppComponent.prototype.getPbp = function () {
        // return this.http.get('https://cors-anywhere.herokuapp.com/' + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/pbp/0021701225_full_pbp.json');
        return this.http.get('../assets/pbp.json');
    };
    AppComponent.prototype.getGameDetails = function () {
        // return this.http.get('https://cors-anywhere.herokuapp.com/' + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/gamedetail/0021701225_gamedetail.json');
        return this.http.get('../assets/details.json');
    };
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__("./src/app/app.component.html"),
            styles: [__webpack_require__("./src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */]])
    ], AppComponent);
    return AppComponent;
}());

var Player = /** @class */ (function () {
    function Player(firstName, lastName, team, rotations) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.team = team;
        this.rotations = rotations;
    }
    return Player;
}());
var Rotation = /** @class */ (function () {
    function Rotation(inGame, startTime, endTime) {
        if (endTime === void 0) { endTime = -1; }
        this.inGame = inGame;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    return Rotation;
}());
var ScoreDifferential = /** @class */ (function () {
    function ScoreDifferential(differential, time) {
        this.differential = differential;
        this.time = time;
    }
    return ScoreDifferential;
}());


/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/esm5/platform-browser.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common_http__ = __webpack_require__("./node_modules/@angular/common/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__("./src/app/app.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["E" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* AppComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_common_http__["b" /* HttpClientModule */]
            ],
            providers: [],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};


/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/esm5/platform-browser-dynamic.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* enableProdMode */])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map