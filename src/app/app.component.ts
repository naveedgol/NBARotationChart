import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'q';

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
  playerIds: Player[][] = [[],[]];

  period = 1;
  allPeriods = [1,2,3,4];
  players: Map<number, Player> = new Map<number, Player>();
  totalGameTime = this.periodStartTime(4+1);

  scores: ScoreDifferential[] = [new ScoreDifferential(0, 0)];

  constructor( private http: HttpClient) {
    this.getGameDetails().subscribe(
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
        this.parseRoster(data['g']['hls']['pstsg'], this.homeTeam);
        this.parseRoster(data['g']['vls']['pstsg'], this.visitingTeam);
      }
    );

    this.getPbp().subscribe(
      data => {
        // bugged if you play a whole period without subbing and without game activity
        for ( let period of data['g']['pd'] ) {
          for ( let event of period['pla'] ) {
            if ( event['etype'] === 8 ) { // substitution
              let playerInId = event['epid'];
              let playerOutId = event['pid'];
              let seconds = this.clockToSecondsElapsed(event['cl']);

              // substitute IN
              this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].inGame = false;
              this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = seconds;
              this.players[playerInId].rotations.push(new Rotation(true, seconds));

              // subsitute OUT
              this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].inGame = true;
              this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].endTime = seconds;
              this.players[playerOutId].rotations.push(new Rotation(false,seconds));
            }
            else if ( event['etype'] === 13 ) { // end of period
              ++this.period;
              for( let id of Object.keys(this.players) ) {
                this.players[id].rotations[this.players[id].rotations.length - 1].endTime = this.periodStartTime(this.period);
                this.players[id].rotations.push(new Rotation(false, this.periodStartTime(this.period)));
              }
            } else if ( event['etype'] === 0 ) { // end of game
              for( let id of Object.keys(this.players) ) {
                this.players[id].rotations.pop();
              }
            } else {
              if ( event['etype'] === 1 || event['etype'] == 3 ) {
                this.scores.push( new ScoreDifferential(event['hs']-event['vs'], this.clockToSecondsElapsed(event['cl'])));
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
        for( let id of Object.keys(this.players) ) {
          let i = 0;
          while ( i < this.players[id].rotations.length - 1 ) {
            if ( this.players[id].rotations[i].inGame === this.players[id].rotations[i+1].inGame ) {
              this.players[id].rotations[i].endTime = this.players[id].rotations[i+1].endTime;
              this.players[id].rotations.splice(i+1, 1);
            } else {
              ++i;
            }
          }
        }
      }
    );
  }

  periodStartTime(period: number): number {
    if( period <= 4 ) { // regulation
      return 60*12*(period-1);
    } else { // OT
      return 60*12*4 + 60*5*(period-5);
    }
  }

  clockToSecondsElapsed(clock: string): number {
    // XX:XX to seconds
    return this.periodStartTime(this.period + 1) - (parseInt(clock.substring(0,2))*60 + parseInt(clock.substring(3,5)));
  }

  parseRoster(rosterJson, team: string) {
    for( let player of rosterJson ) {
      if ( player['min'] ) { // if the player plays
        if ( team === this.homeTeam ) {
          this.playerIds[0].push(player['pid']);
        } else {
          this.playerIds[1].push(player['pid']);
        }

        this.players[player['pid']] = new Player(
          player['fn'],
          player['ln'],
          team,
          [ new Rotation(player['court'] === 1, 0) ]
        );
      }
    }
  }

  getPbp() {
    // return this.http.get('https://cors-anywhere.herokuapp.com/' + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/pbp/0021701225_full_pbp.json');
    return this.http.get('./assets/pbp.json');
  }

  getGameDetails() {
    // return this.http.get('https://cors-anywhere.herokuapp.com/' + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/gamedetail/0021701225_gamedetail.json');
    return this.http.get('./assets/details.json');
  }

  //http://stats.nba.com/js/data/widgets/boxscore_breakdown_20180411.json
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
  differential: number; // point differential
  time: number; //time since last point

  constructor(differential, time) {
    this.differential = differential;
    this.time = time;
  }
}