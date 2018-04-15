import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  rots: Rotation[] = []
  homePlayers = [];
  visitingPlayers = [];

  players: Map<number, Player> = new Map<number, Player>();

  constructor( private http: HttpClient) {


    this.getGameDetails().subscribe(
      data => {
        for( let player of data['g']['hls']['pstsg'] ) {
          this.players[player['pid']] = new Player(player['fn'], player['ln'], [new Rotation(true, 48*60,0)]);
        }
        console.log(Object.keys(this.players)); // court = starter
      }
    );

    // this.getPbp().subscribe(
    //   data => {
    //     console.log(data);
    //     for ( let q = 0; q < data['g']['pd'].length; ++q ) {
    //       for ( let i = 0; i < data['g']['pd'][q]['pla'].length; ++i ) {
    //         if ( data['g']['pd'][q]['pla'][i]['etype'] === 8 ) {
    //           this.rots.push( new Rotation(
    //             data['g']['pd'][q]['pla'][i]['de'].substring(1,4),
    //             // data['g']['pd'][q]['pla'][i]['de'].match('\\[.+\\]\\s([A-z]+)')[1],
    //             parseInt(data['g']['pd'][q]['pla'][i]['epid']),
    //             // data['g']['pd'][q]['pla'][i]['de'].match('\\[.+\\]\\s[A-z]+\\sSubstitution\\sreplaced\\sby\\s([A-z]+)')[1],
    //             data['g']['pd'][q]['pla'][i]['pid'],
    //             data['g']['pd'][q]['pla'][i]['cl'],
    //             q
    //           ) );
    //         }
    //       }
    //     }
    //     console.log(this.rots);
    //   }
    // );

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
  rotations: Rotation[];

  constructor(
    firstName: string,
    lastName: string,
    rotations: Rotation[]
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
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
