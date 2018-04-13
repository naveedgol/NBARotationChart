import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  rots: Rotation[] = []
  constructor(
    private http: HttpClient
  ) {
    this.getPbp().subscribe(
      data => {
        for ( let q = 0; q < data['g']['pd'].length; ++q ) {
          for ( let i = 0; i < data['g']['pd'][q]['pla'].length; ++i ) {
            if ( data['g']['pd'][q]['pla'][i]['etype'] === 8 ) {
              this.rots.push( new Rotation(
                data['g']['pd'][q]['pla'][i]['de'].substring(1,4),
                data['g']['pd'][q]['pla'][i]['de'].match('\\[.+\\]\\s([A-z]+)')[1],
                data['g']['pd'][q]['pla'][i]['de'].match('\\[.+\\]\\s[A-z]+\\sSubstitution\\sreplaced\\sby\\s([A-z]+)')[1],
                data['g']['pd'][q]['pla'][i]['cl'],
                q
              ) );
            }
          }
        }
        console.log(this.rots);
      }
    );
  }

  getPbp() {
    //'https://cors-anywhere.herokuapp.com/' + 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/pbp/0021701225_full_pbp.json'
    return this.http.get('../assets/pbp.json');
  }
}

class Rotation {
  team: string;
  playerIn: string;
  playerOut: string;
  time: number;
  quarter: number;

  constructor( team: string, playerIn: string, playerOut: string, time: number, quarter: number) {
    this.team = team;
    this.playerIn = playerIn;
    this.playerOut = playerOut;
    this.time = time;
    this.quarter = quarter;
  }
}
