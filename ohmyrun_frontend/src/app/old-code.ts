import { Component, OnInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { HttpClient } from '@angular/common/http';
import { FormComponentComponent } from './form-component/form-component.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Formulario } from '../app/_model/Formulario';
import { Marca } from '../app/_model/Marca';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  formulario: Formulario = new Formulario();
  form: FormGroup;
  title = 'ohmyrun_frontend';
  latitude: number;
  longitude: number;
  habilitarMensaje: boolean = false;
  map: google.maps.Map;
  location: google.maps.LatLng;
  markers: Marca[] = [];

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      mensaje: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    let loader = new Loader({
      apiKey: 'AIzaSyD_rpFGfqEPwCj-WYoFMRXse8QZdCheJEI',
    });
    

    loader.load().then(() => {
      console.log('loaded gmaps');

      if (!navigator.geolocation) {
        console.log('location is not supported');
      }
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(
          `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
        );
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.map = new google.maps.Map(
          document.getElementById('map') as HTMLElement,
          {
            center: location,
            zoom: 15,
          }
        );

        this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
          console.log('this.map.addListener(click, (event: google.maps.MapMouseEvent) => {');
          if (event.latLng) {
            console.log(event.latLng.lat(), event.latLng.lng());
            this.latitude = event.latLng.lat(),
            this.longitude = event.latLng.lng(),
            this.habilitarMensaje = true;
            this.addMarker(event.latLng, this.map);
          }
          this.getMarkers();
          this.renderMarkers();
        });
      });
    });
  }
  selectedMarker: any;

  setSelectedMarker(marker: google.maps.Marker) {
    console.log('setSelectedMarker(marker: any)');
    this.selectedMarker = marker;
  }

  guardar() {
    console.log('Formulario', this.formulario);
    this.saveMarkers();
  }

  addMarker(location: google.maps.LatLng, map: google.maps.Map) {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });
    marker.addListener('click', () => {
      this.setSelectedMarker(marker);
    });
  }

  saveMarkers() {
    const markerJson = {
      latitude: this.latitude,
      longitude: this.longitude,
      description: this.formulario.mensaje
    };

    // Code to save the markers to a database or local storage.
    this.http.post('https://oh-my-run.herokuapp.com/pin', markerJson).subscribe({
      next: (data) => {
        console.log('Successfully saved the markers to the database');
      },
      error: (error) => {
        console.error(
          'An error occurred while saving the markers to the database: ',
          error
        );
      },
    });
  }
  getMarkers() {
    console.log(' getMarkers ');
    this.http.get('https://oh-my-run.herokuapp.com/pin').subscribe({
      next: (data) => {
        this.markers = Array.prototype.slice.call(data);
        console.log('this.markers', this.markers);
      },
      error: (error) => {
        console.error(
          'An error occurred while retrieving the markers from the database: ',
          error
        );
      },
    });

  }
//
  renderMarkers() {
    console.log('renderMarkers');
    this.markers.forEach((marker) => {
      console.log('Recorriendo y poniendo pin id'+marker.id);
      const position = new google.maps.LatLng(marker.latitude, marker.longitude);

      const newMarker = new google.maps.Marker({
        position: position,
        map: this.map
      });

      newMarker.addListener('click', () => {
        this.setSelectedMarker(newMarker);
      });
    });
  }

  // loadAllMarkers(): void {
  //   this.markers.forEach(marker => {
  //     //Creating a new marker object
  //     const position = new google.maps.LatLng(marker.latitude, marker.longitude);
  //     const newMarker = new google.maps.Marker({
  //       position: position,
  //       map: this.map
  //     });

  //     //creating a new info window with markers info
  //     const infoWindow = new google.maps.InfoWindow({
  //       content: newMarker.getTitle()
  //     });

  //     //Add click event to open info window on marker
  //     newMarker.addListener("click", () => {
  //       infoWindow.open(newMarker.getMap(), newMarker);
  //     });

  //     //Adding marker to google map
  //     newMarker.setMap(this.map);
  //   });
  // }

}