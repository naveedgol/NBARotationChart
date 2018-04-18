import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'q';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  period = 1;
  players: Map<number, Player> = new Map<number, Player>();
  totalGameTime = 48*60 + 5*60;

  constructor( private http: HttpClient) {
    this.getGameDetails().subscribe(
      data => {
        this.parseRoster(data['g']['hls']['pstsg'], data['g']['hls']['ta']); // home
        this.parseRoster(data['g']['vls']['pstsg'], data['g']['vls']['ta']); // visitors
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
              let time = event['cl']; //XX:XX
              let seconds =  this.periodStartTime(this.period + 1) - (parseInt(time.substring(0,2))*60 + parseInt(time.substring(3,5)));

              // substitute IN
              this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].playing = false;
              this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = seconds;
              this.players[playerInId].rotations.push(new Rotation(true, seconds));

              // subsitute OUT
              this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].playing = true;
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
              const pid = event['pid'];
              const epid = event['epid'];
              if ( this.players[pid] ) {
                this.players[pid].rotations[this.players[pid].rotations.length - 1].playing = true;
              }
              if ( this.players[epid] ) {
                this.players[epid].rotations[this.players[epid].rotations.length - 1].playing = true;
              }
            }
          }
        }
        // merge continous play over quarters
        for( let id of Object.keys(this.players) ) {
          let i = 0;
          while ( i < this.players[id].rotations.length - 1 ) {
            if ( this.players[id].rotations[i].playing === this.players[id].rotations[i+1].playing ) {
              this.players[id].rotations[i].endTime = this.players[id].rotations[i+1].endTime;
              this.players[id].rotations.splice(i+1, 1);
            } else {
              ++i;
            }
          }
        }
        console.log(this.players);
      }
    );
  }

  periodStartTime(period: number): number {
    if( period <= 4 ) // regulation
    {
      return 60*12*(period-1);
    } else { // OT
      return 60*12*4 + 60*5*(period-5);
    }
  }

  parseRoster(rosterJson, team: string) {
    for( let player of rosterJson ) {
      this.players[player['pid']] = new Player(
        player['fn'],
        player['ln'],
        team,
        [ new Rotation(player['court'] === 1, 0) ]
      );
    }
  }

  getPbp() {
    //'https://cors-anywhere.herokuapp.com/' + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/pbp/0021701225_full_pbp.json'
    return this.http.get('../assets/pbp.json');
  }

  getGameDetails() {
    //https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/gamedetail/0021701225_gamedetail.json
    return this.http.get('../assets/details.json');
  }

  getIter() {
    return Object.keys(this.players)
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
  playing: boolean;
  startTime: number;
  endTime: number;

  constructor(
    playing: boolean,
    startTime: number,
    endTime: number = -1
  ) {
    this.playing = playing;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
