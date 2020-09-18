import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  homeTeam: string;
  visitingTeam: string;
  homeScore: number;
  visitingScore: number;
  playerIds: Player[][] = [[], []];

  chartReady = false;
  period = 1;
  allPeriods = [1, 2, 3, 4];
  players: Map<number, Player> = new Map<number, Player>();
  totalGameTime = this.periodStartTime(4 + 1);

  scores: ScoreDifferential[] = [new ScoreDifferential(0, 0)];
  chartHeight = 0;

  games: Game[] = [];
  currentDate: Date = new Date();
  gameSelected: Game;
  loadingBoxScore = true;

  constructor( private http: HttpClient) {
    this.getBoxScores(this.currentDate).subscribe(
      data => {
        this.loadingBoxScore = false;
        for ( const game of data['games'] ) {
          this.games.push(new Game(
            game['gameId'],
            game['hTeam']['triCode'],
            game['vTeam']['triCode'],
            game['hTeam']['score'],
            game['vTeam']['score'],
            game['statusNum'] === 3
          ));
        }
        if ( this.games.length ) {
          if ( this.games[0].final ) {
            this.gameSelected = this.games[0];
            this.generateChart(this.games[0].id);
          }
        }
      }
    );
  }

  generateBoxScores() {
    this.games = [];
    this.loadingBoxScore = true;
    this.getBoxScores(this.currentDate).subscribe(
      data => {
        this.loadingBoxScore = false;
        for ( const game of data['games'] ) {
          this.games.push(new Game(
            game['gameId'],
            game['hTeam']['triCode'],
            game['vTeam']['triCode'],
            game['hTeam']['score'],
            game['vTeam']['score'],
            game['statusNum'] !== 1
          ));
        }
      }
    );
  }

  generateChart(gameId: string) {

    this.chartReady = false;
    this.players = new Map<number, Player>();
    this.playerIds = [[], []];
    this.period = 1;
    this.allPeriods = [1, 2, 3, 4];
    this.scores = [new ScoreDifferential(0, 0)];
    this.chartHeight = 0;

    this.getGameDetails(gameId).subscribe(
      data => {
        const totalPeriods = data['g']['p'];
        for ( let i = 5; i <= totalPeriods; ++i ) {
          this.allPeriods.push(i);
        }
        this.totalGameTime = this.periodStartTime(totalPeriods + 1);
        this.homeTeam = data['g']['hls']['ta'];
        this.homeScore = data['g']['hls']['s'];
        this.visitingTeam = data['g']['vls']['ta'];
        this.visitingScore = data['g']['vls']['s'];

        if ( data['g']['hls']['pstsg'] && data['g']['vls']['pstsg'] ) {
          this.parseRoster(data['g']['hls']['pstsg'], this.homeTeam);
          this.parseRoster(data['g']['vls']['pstsg'], this.visitingTeam);
        } else {
          console.log('Game hasnt begun.');
          return;
        }

        this.getPbp(gameId).subscribe(
          pbp => {
            this.buildRotations(pbp);
          }
        );
      }
    );
  }

  buildRotations(data): void {
    // bugged if you play a whole period without subbing and without game activity
    for ( const period of data['g']['pd'] ) {
      for ( const event of period['pla'] ) {
        if ( event['etype'] === 8 ) { // substitution
          const playerInId = event['epid'];
          const playerOutId = event['pid'];
          const seconds = this.clockToSecondsElapsed(event['cl']);

          // substitute IN
          this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].inGame = false;
          this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = seconds;
          this.players[playerInId].rotations.push(new Rotation(true, seconds));

          // subsitute OUT
          this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].inGame = true;
          this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].endTime = seconds;
          this.players[playerOutId].rotations.push(new Rotation(false, seconds));
        } else if ( event['etype'] === 13 ) { // end of period
          ++this.period;
          for ( const id of Object.keys(this.players) ) {
            this.players[id].rotations[this.players[id].rotations.length - 1].endTime = this.periodStartTime(this.period);
            this.players[id].rotations.push(new Rotation(false, this.periodStartTime(this.period)));
          }
        } else if ( event['etype'] === 0 ) { // end of game
          for ( const id of Object.keys(this.players) ) {
            this.players[id].rotations.pop();
          }
        } else {
          if ( event['etype'] === 1 || event['etype'] === 3 ) {
            if ( this.chartHeight < event['hs'] - event['vs'] ) {
              this.chartHeight = event['hs'] - event['vs'];
            }
            this.scores.push( new ScoreDifferential(event['hs'] - event['vs'], this.clockToSecondsElapsed(event['cl'])));
          }
          const pid = event['pid'];
          const epid = event['epid'];
          if ( this.players[pid] ) {
            this.players[pid].rotations[this.players[pid].rotations.length - 1].inGame = true;
          }
          if ( this.players[epid] ) {
            this.players[epid].rotations[this.players[epid].rotations.length - 1].inGame = true;
          }
        }
      }
    }
    // merge continous play over quarters
    for ( const id of Object.keys(this.players) ) {
      let i = 0;
      while ( i < this.players[id].rotations.length - 1 ) {
        if ( this.players[id].rotations[i].inGame === this.players[id].rotations[i + 1].inGame ) {
          this.players[id].rotations[i].endTime = this.players[id].rotations[i + 1].endTime;
          this.players[id].rotations.splice(i + 1, 1);
        } else {
          ++i;
        }
      }
    }

    this.scores.push(new ScoreDifferential(this.scores[this.scores.length - 1].differential, this.totalGameTime));
    this.chartReady = true;
  }

  periodStartTime(period: number): number {
    if ( period <= 4 ) { // regulation
      return 60 * 12 * (period - 1);
    } else { // OT
      return 60 * 12 * 4 + 60 * 5 * (period - 5);
    }
  }

  clockToSecondsElapsed(clock: string): number {
    // XX:XX to seconds
    return this.periodStartTime(this.period + 1) - (parseInt(clock.substring(0, 2), 10) * 60 + parseInt(clock.substring(3, 5), 10));
  }

  parseRoster(rosterJson, team: string) {
    for ( const player of rosterJson ) {
      if ( player['totsec'] ) { // if the player plays
        if ( team === this.homeTeam ) {
          this.playerIds[0].push(player['pid']);
        } else {
          this.playerIds[1].push(player['pid']);
        }

        this.players[player['pid']] = new Player(
          player['fn'],
          player['ln'],
          team,
          [ new Rotation(false, 0) ]
        );
      }
    }
  }

  getPbp(gameId: string) {
    return this.http.get(
      'https://cors-anywhere.herokuapp.com/'
      + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/' + this.getCurrentSeasonYear() + '/scores/pbp/'
      + gameId + '_full_pbp.json'
    );
  }

  getGameDetails(gameId: string) {
    return this.http.get(
      'https://cors-anywhere.herokuapp.com/'
      + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/' + this.getCurrentSeasonYear() + '/scores/gamedetail/'
      + gameId + '_gamedetail.json'
    );
  }

  getBoxScores(date: Date) {
    return this.http.get(
      'https://cors-anywhere.herokuapp.com/'
      + 'http://data.nba.net/data/10s/prod/v1/'
      + date.getFullYear() + this.padNumber((date.getMonth() + 1)) + this.padNumber(date.getDate()) + '/scoreboard.json'
    );
  }

  changeGame(game: Game) {
    if ( this.gameSelected === game || !game.final) {
      return;
    }
    this.gameSelected = game;
    this.generateChart(game.id);
  }

  padNumber(num: number): string {
    if ( num < 10 ) {
      return '0' + num.toString();
    }
    return num.toString();
  }

  setDate(direction: number) {
    this.currentDate = new Date( this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + direction );
  }

  getCurrentSeasonYear(): number {
    const septMonthIndex = 9; // season end
    if ( this.currentDate.getMonth() <= septMonthIndex ) {
      return this.currentDate.getFullYear() - 1;
    } else {
      return this.currentDate.getFullYear();
    }
  }
}

class Player {
  firstName: string;
  lastName: string;
  team: string;
  rotations: Rotation[];

  constructor(
    firstName: string,
    lastName: string,
    team: string,
    rotations: Rotation[]
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.team = team;
    this.rotations = rotations;
  }
}

class Game {
  id: string;
  homeTeam: string;
  visitingTeam: string;
  homeScore: number;
  visitingScore: number;
  final: boolean;

  constructor(
    id: string,
    homeTeam: string,
    visitingTeam: string,
    homeScore: number,
    visitingScore: number,
    final: boolean
  ) {
    this.id = id;
    this.homeTeam = homeTeam;
    this.visitingTeam = visitingTeam;
    this.homeScore = homeScore;
    this.visitingScore = visitingScore;
    this.final = final;
  }
}

class Rotation {
  inGame: boolean;
  startTime: number;
  endTime: number;

  constructor(
    inGame: boolean,
    startTime: number,
    endTime: number = -1
  ) {
    this.inGame = inGame;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

class ScoreDifferential {
  differential: number;
  time: number;

  constructor(differential, time) {
    this.differential = differential;
    this.time = time;
  }
}
