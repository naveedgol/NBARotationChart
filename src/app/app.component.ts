import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'q';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  quarter = 1;
  players: Map<number, Player> = new Map<number, Player>();

  constructor( private http: HttpClient) {


    this.getGameDetails().subscribe(
      data => {
        this.parseRoster(data['g']['hls']['pstsg'], data['g']['hls']['ta']); // home
        this.parseRoster(data['g']['vls']['pstsg'], data['g']['vls']['ta']); // visitors
      }
    );

    this.getPbp().subscribe(
      data => {
        for ( let quarter of data['g']['pd'] ) {
          for ( let event of quarter['pla'] ) {
            if ( event['etype'] === 8 ) { // substitution
              let playerInId = event['epid'];
              let playerOutId = event['pid'];
              let time = event['cl']; //XX:XX
              let seconds = parseInt(time.substring(0,2))*60 + parseInt(time.substring(3,5)) + (4 - this.quarter)*60*12;

              //if you're subbing in and you're already "playing" means you were subbed out at the quarter
              if ( this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].playing ) {
                this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = (4 - this.quarter + 1)*60*12;
                this.players[playerInId].rotations.push(new Rotation(false, (4 - this.quarter + 1)*60*12, seconds));
              } else {
                this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = seconds;
              }
              this.players[playerInId].rotations.push(new Rotation(true, seconds));

              //if you're subbing out and you're already not "playing" means you were subbed in at the quarter
              if ( !this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].playing ) {
                this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].endTime = (4 - this.quarter + 1)*60*12;
                this.players[playerOutId].rotations.push(new Rotation(true, (4 - this.quarter + 1)*60*12, seconds));
              } else {
                this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].endTime = seconds;
              }
              this.players[playerOutId].rotations.push(new Rotation(false,seconds));
            }
            else if ( event['etype'] === 13 ) { // end of quarter
              ++this.quarter;
            } else if ( event['etype'] === 0 ) {
              for( let id of Object.keys(this.players) ) { // end of game
                this.players[id].rotations[this.players[id].rotations.length - 1].endTime = (4-this.quarter)*12*60;
              }
            }
          }
        }
      }
    );

  }

  parseRoster(rosterJson, team: string) {
    for( let player of rosterJson ) {
      this.players[player['pid']] = new Player(
        player['fn'],
        player['ln'],
        team,
        [ new Rotation(player['court'] === 1, 48*60) ]
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
