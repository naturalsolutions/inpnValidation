import { Component, OnInit,Input,OnChanges } from '@angular/core';
import { tileLayer, latLng, marker, Marker } from 'leaflet';
import { ObservationService } from '../services/observation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";
import 'leaflet';
import 'leaflet.markercluster';
const L = window['L'];

@Component({
  selector: 'app-obs-map',
  templateUrl: './obs-map.component.html',
  styleUrls: ['./obs-map.component.scss']
})
export class ObsMapComponent implements OnInit,OnChanges  {
  @Input() filter;
  observations: any;
  noObs: boolean;
  obsLoaded: boolean;
  mymap;

  mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
  mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>'


  constructor(private spinner: NgxSpinnerService,
    private observationService: ObservationService) { }

  ngOnInit() {
    this.getObs()
  }
  ngOnChanges() {
    this.getObs(this.filter)
}
  getObs(filter?) {
    this.spinner.show();
    this.obsLoaded = false;
    let obsFilter = {
      "filtreStatutValidation": "5",
      "filtrePhotoValidated": "true",
    }
    if (filter) {
      obsFilter["filtreName"] = filter.filtreName;
      obsFilter["filtreValue"] = filter.filtreValue
    }
    this.observationService.getObservations({
    }, obsFilter)
      .subscribe(
        (obs) => {
          if (!obs) {
            console.log("no obs");
            this.noObs = true;
          }
          else {
            this.noObs = false;
            this.observations = obs;
          }
        },
        (error) => console.log("getObservationsErr", error),
        () => {
          if (this.observations) {
            if (this.mymap != undefined || this.mymap != null) {
              this.mymap.remove();
            }
            this.mymap = L.map('mapid').setView([43.3, 5.4], 13);
            var street = L.tileLayer(this.mbUrl, {
              attribution: this.mbAttr,
              maxZoom: 18,
              id: 'mapbox.streets',
              accessToken: 'pk.eyJ1IjoiYW1pbmVoYW1vdWRhIiwiYSI6ImNqM3dwYmdqdTAwMG8zMnBrNms0NG1pNDYifQ.odRR1wKtv3NpwNy3fsp5yw'
            }).addTo(this.mymap);
            var satellite = L.tileLayer(this.mbUrl, {
              attribution: this.mbAttr,
              maxZoom: 18,
              id: 'mapbox.satellite',
              accessToken: 'pk.eyJ1IjoiYW1pbmVoYW1vdWRhIiwiYSI6ImNqM3dwYmdqdTAwMG8zMnBrNms0NG1pNDYifQ.odRR1wKtv3NpwNy3fsp5yw'
            })

            var baseLayers = {
              "Satellite": satellite,
              "Streets": street
            };

            L.control.layers(baseLayers).addTo(this.mymap);
            var markersList = L.markerClusterGroup();
            _.forEach(this.observations.observations, (element) => {
              let customPopup = '<div class="img-inner"> <img class="img-popUp" src=' + element.photos[0].thumbnailFileUri + '> </div><br>'
                 + '<p>'+element.lbGroupSimple + '</p>'
                 + '<p>'+ element.lbGroupOP + '</p>'
                 + '<p>'+ element.nomComplet + '</p>';
                
            let customOptions =
            {
              
              'className': 'custom'
            }
              markersList.addLayer(L.marker([element.Y, element.X])
                .bindPopup(customPopup, customOptions));
            });

            this.mymap.addLayer(markersList);
            console.log("this.observations_map", this.observations);
            this.obsLoaded = true;
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
          }
        }
      )
  }

 
}
