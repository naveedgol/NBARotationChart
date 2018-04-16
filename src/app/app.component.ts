import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'q';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  rots: Rotation[] = []
  homePlayers = [];
  visitingPlayers = [];
  quarter = 1;
  players: Map<number, Player> = new Map<number, Player>();

  constructor( private http: HttpClient) {


    this.getGameDetails().subscribe(
      data => {
        for( let player of data['g']['hls']['pstsg'] ) {
          this.players[player['pid']] = new Player(
            player['fn'],
            player['ln'],
            data['g']['hls']['ta'],
            [ new Rotation(player['court'] === 1, 48*60) ]
          );
        }
        for( let player of data['g']['vls']['pstsg'] ) {
          this.players[player['pid']] = new Player(
            player['fn'],
            player['ln'],
            data['g']['vls']['ta'],
            [ new Rotation(player['court'] === 1, 48*60) ]
          );
        }
        console.log(this.players);
      }
    );

    this.getPbp().subscribe(
      data => {
        console.log(data);
        for ( let q = 0; q < data['g']['pd'].length; ++q ) {
          for ( let i = 0; i < data['g']['pd'][q]['pla'].length; ++i ) {
            if ( data['g']['pd'][q]['pla'][i]['etype'] === 8 ) {
              let playerInId = data['g']['pd'][q]['pla'][i]['epid'];
              let playerOutId = data['g']['pd'][q]['pla'][i]['pid'];
              let time = data['g']['pd'][q]['pla'][i]['cl']; //XX:XX
              let seconds = parseInt(time.substring(0,2))*60 + parseInt(time.substring(3,5)) + (4 - this.quarter)*60*12;

              //if you're subbing in and you're already "playing" means you were subbed out at the quarter
              if ( this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].playing ) {
                this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = (4 - this.quarter + 1)*60*12;
                this.players[playerInId].rotations.push(new Rotation(false, (4 - this.quarter + 1)*60*12, seconds));
              } else {
                this.players[playerInId].rotations[this.players[playerInId].rotations.length - 1].endTime = seconds;
              }
              this.players[playerInId].rotations.push(new Rotation(
                true,
                seconds
              ));

              //if you're subbing out and you're already not "playing" means you were subbed in at the quarter
              if ( !this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].playing ) {
                this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].endTime = (4 - this.quarter + 1)*60*12;
                this.players[playerOutId].rotations.push(new Rotation(true, (4 - this.quarter + 1)*60*12, seconds));
              } else {
                this.players[playerOutId].rotations[this.players[playerOutId].rotations.length - 1].endTime = seconds;
              }
              this.players[playerOutId].rotations.push(new Rotation(
                false,
                seconds
              ));
              // console.log("In:" + this.players[playerInId].lastName + " Out:" + this.players[playerOutId].lastName + " Time:" + seconds);
            }
            else if ( data['g']['pd'][q]['pla'][i]['etype'] === 13 ) {
              for( let id of Object.keys(this.players) ) {
                if ( this.quarter === 4 ) {
                  this.players[id].rotations[this.players[id].rotations.length - 1].endTime = (4-this.quarter)*12*60;
                }
              }
              ++this.quarter;
            }
          }
        }
        console.log(this.players);
      }
    );

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
