import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { IGeoJson, IGeometry, FeatureCollection } from 'src/app/models/map';
import { MapService } from 'src/app/services/map.service';


@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.css']
})
export class MapBoxComponent implements OnInit {

  /// default settings
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';
  lat = -24.962198;
  lng = -53.462055;
  message = '';

  // data
  source: any;
  markers: any;

  constructor(private mapService: MapService) {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit() {
    this.getMarkers()
    .then(() => this.initializeMap());
  }

  private async getMarkers() {
    this.markers = null;
    this.mapService.getMarkers()
    .then(rawData => this.markers = rawData);
  }

  private initializeMap() {
    /// locate the user
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.map.flyTo({
          center: [this.lng, this.lat]
        });
      });
    }
    this.buildMap();
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat]
    });

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());

    //// Add Marker on Click
    this.map.on('click', (event) => {
      const coordinates: IGeometry = {
        type: 'Point',
        coordinates: [event.lngLat.lng, event.lngLat.lat]
      };
      const newMarker: IGeoJson = {
        type: 'Feature',
        geometry: coordinates,
        properties: { message: this.message }
      };
      this.mapService.createMarker(newMarker);
      this.message = '';
      this.getMarkers();
    });

    /// Add realtime firebase data on map load
    this.map.on('load', (event) => {

      /// register source
      this.map.addSource('firebase', {
         type: 'geojson',
         data: {
           type: 'FeatureCollection',
           features: []
         }
      });

      /// get source
      this.source = this.map.getSource('firebase');

      /// subscribe to realtime database and set data source
      this.markers.subscribe(marker => {
        const data = new FeatureCollection(marker);
        this.source.setData(data);
      });

      /// create map layers with realtime data
      this.map.addLayer({
        id: 'firebase',
        source: 'firebase',
        type: 'symbol',
        layout: {
          'text-field': '{message}',
          'text-size': 10,
          'text-transform': 'uppercase',
          'icon-image': 'marker-15',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#f16624',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });
    });
  }

  /// Helpers

  removeMarker(marker: IGeoJson) {
    this.mapService.removeMarker(marker.$key);
  }

  flyTo(data: IGeoJson) {
    this.map.flyTo({
      center: [data.geometry.coordinates[0], data.geometry.coordinates[1]]
    });
  }
}
