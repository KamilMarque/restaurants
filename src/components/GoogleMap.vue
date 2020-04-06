<template>
  <div class="" id="map">
    <div class="container">
      <div id="infos">
        <div class="six wide column">
          <!-- search parameters -->
          <form class="ui segment large form">
            <div class="ui segment">
              <div class="field">
                <div class="ui form">
                  <select class="ui search dropdown" v-model="radius">
                    <option disabled value="">Distance...</option>
                    <option value="5">5 KM</option>
                    <option value="10">10 KM</option>
                    <option value="15">15 KM</option>
                    <option value="20">20 KM</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <div class="ui right icon input large">
                  <star-rating style="margin-right: 45px" v-bind:star-size="25" v-model="minRating" v-bind:show-rating="false"></star-rating>
                  <div class="ui buttons">
                    <button class="ui button" @click.prevent="resetParams">Reset</button>
                    <div class="or"></div>
                    <button class="ui button secondary" @click.prevent="getPlaces">Search</button>
                  </div>
                  <i class="large location arrow link icon" @click.prevent="panTo(center)"></i>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div id="placesList" class="ten wide column segment ui">
          <!-- new restaurent tamplete -->
          <New-Restaurant ref="newRes" :google='google' :markers='markers' :places='places' :location='addLocation' :add="add === true"  @close="close"></New-Restaurant>
          <div>
            <!-- list of places -->
            <section class="ui divided items" v-for="(place) in places" :key="place.id">
                <div :id="'place-' + place.id" class="item" v-if="show(place)" ref="target" @click.prevent="showReviews(place)">
                <div>
                  <button v-if="active === place.id" class="ui labeled icon button secondary">
                    <i class="left chevron icon"></i>
                    back
                  </button>

                  <div class="profilPictureRestaurant" v-bind:style="{ 'background-image': 'url(' + place.url + ')' }"></div>
                  <div class="restaurantName">{{place.name}}</div>
                  <div>
                    <star-rating style="display: inline-block; vertical-align: middle" v-bind:star-size="15" v-bind:read-only="true" v-bind:rating="place.rating" v-bind:show-rating="false"></star-rating>
                    <p style="display: inline">({{place.user_ratings_total}})</p>
                  </div>
                  <div class="vicinity">{{place.vicinity}}</div>
                </div>
              </div>
              <list-item :selected-place='place' :markers="markers" :expanded="active === place.id" @scrollTo="scrollTo(place)"></list-item>
            </section>
            <!-- Loader during searching -->
            <div v-if="showLoader" class="ui segment">
              <div class="ui active inverted dimmer">
                <div class="ui text loader">Loading</div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div id="mapContainer">
        <GmapMap  id="map" ref="mapRef" :center="{lat: this.center.lat, lng: this.center.lng}" :zoom="17"  map-type-id="hybrid" @click="addRestaurant">
        <gmap-marker class="marker" :key="index" v-for="(m, index) in markersFilter" :icon="m.icon" :position="m.position" @click="toggleInfoWindow(m, index)"></gmap-marker>
        <gmap-info-window :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="infoWinOpen=false, active=0">
          <div v-html="infoContent"></div>
        </gmap-info-window>
      </GmapMap>
      </div>
    </div>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps'
import axios from 'axios'
import ListItem from './ListItem'
import StarRating from 'vue-star-rating'
import NewRestaurant from './AddRestaurant'

export default {
  name: 'GoogleMap',
  components: { ListItem, StarRating, NewRestaurant},
  data () {
    return {
      service: null,
      isSearching: false, // check if user is searching restaurants 
      loader: false,
      tmpLoader: true,
      minRating: 0,
      active: 0, // take the place.id whitch the user clicked on
      add: false, // allow to show the new resto form
      markers: [],
      places: [],
      radius: 5, // define the distance search
      addLocation: { // default new resto location
        lat: 12,
        lng: 12
      },
      center: { // default user location
        lat : 48.866667,
        lng: 2.333333
      },
      infoWindowPos: { // array for info window markers
        lat: 0,
        lng: 0
      },
      infoOptions: { // options for info window
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
      infoContent: '', // content for info window
      currentMidx: -1, // take the index marker whitch the user clicked on
      infoWinOpen: false, // if true show the info window
    }
  },
  mounted () {
    this.geolocate()
    this.$refs.mapRef.$mapPromise.then((map) => { this.service = new this.google.maps.places.PlacesService(map) })
  },

  computed: {
    google: gmapApi,
    markersFilter () { return this.minRating > 0 ? this.markers.filter(i => i.rating + 0.9 >= this.minRating || i.name === 'Votre position') : this.markers },
    showLoader () { return ((this.loader === true &&  this.tmpLoader === true) ? true : false) }
  },

  methods: {
    // should I show restaurant in the list
    show (place) { return ((this.active === place.id || this.active === 0) && (place.rating + 0.9 >= this.minRating || this.active === place.id)) ? true : false },

    toggleInfoWindow (marker, idx) {
      if (this.markers[idx].name !== 'Votre position') {
        this.infoWindowPos = marker.position
        this.infoContent = this.getInfoWindowContent(marker)
        this.infoWinOpen = true
        this.currentMidx = idx
        this.panTo(marker.position)
        this.active = marker.id
        this.add = false
      }
    },

    getInfoWindowContent (marker) {
      return (
        `<div class="">
          <div class="">
            <div>${marker.name}</div>
            <div class="">${marker.vicinity}</div> 
          </div>
        </div>`)
    },

    resetParams () {
      this.minRating = 0
      this.radius = 5
    },

    geolocate () {
      navigator.geolocation.getCurrentPosition(position => {
        this.center = {
          lat: parseFloat(position.coords.latitude),
          lng: parseFloat(position.coords.longitude)
        }
        this.depart = this.center
        this.markers.push({ position: this.center, name: 'Votre position', icon: {url: "https://maps.google.com/mapfiles/kml/paddle/blu-circle.png"} })
      })     
    },

    panTo (place) {
      this.$refs.mapRef.$mapPromise.then((map) => {
        map.panTo(place)
      })
    },

    showReviews (place) {
      this.panTo(place.position)
      this.active = this.active === place.id ? 0 : place.id
      this.tmpLoader = this.tmpLoader === true ? false : true
    },

    checkRating (result) { return !result.rating ? 0 : result.rating },
    getRatingTotal (result) { return !result.user_ratings_total ? 0 : result.user_ratings_total },
    getUrlPhotoFromStreetView (location) { return axios.get(`https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${location.lat()},${location.lng()}&heading=70&pitch=0&key=AIzaSyAoyHI-r4PMeidsDSnEKuvr4H_LsmzBO-A`) },
    
    async getUrlPhoto (result) {
      if (result.photos) { return (result.photos[0].getUrl()) }
      else {
        let res = await this.getUrlPhotoFromStreetView(result.geometry.location)
        return (res.config.url)
      }
    },

    async getReviews (result) {
      const URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=reviews&key=AIzaSyAoyHI-r4PMeidsDSnEKuvr4H_LsmzBO-A`
      let res = await axios.get(URL)
      return !res ? [] : res
    },
    
    getPlaces () { // get places arround position
      if (!this.isSearching) { // to avoid multiples requests
        var request = {
          location: this.center,
          radius: this.radius * 1000,
          type: ['restaurant'],
        }
        this.active = 0
        this.isSearching = this.loader = true
        this.add = false
        this.clearMarkers()
        this.clearPlaces()
        this.service.nearbySearch(request, async (results, status) => {
          if (status === this.google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
              results[i].reviews = []
              let res = await this.getReviews(results[i])
              results[i].reviews = res.data.result.reviews ? res.data.result.reviews : []
              this.pushMarker(results[i])
              this.pushPlace(results[i])
            }
            this.loader = this.isSearching = false
          }
        })
      }
    },

    clearMarkers () {
      for (let i = 0; i < this.markers.length; i++) {
        if (this.markers[i].fromJson != true) {
          this.markers.splice(i, 1)
          i--
        }
      }
      this.markers.push({ position: this.center, name: 'Votre position', icon: {url: "https://maps.google.com/mapfiles/kml/paddle/blu-circle.png"} })
    },

    clearPlaces () {
      for (let i = 0; i < this.places.length; i++) {
        if (this.places[i].fromJson != true) {
          this.places.splice(i, 1)
          i--
        }
      }
    },

    async pushPlace (result) {
      this.places.push({
        position: result.geometry.location,
        name: result.name,
        url: await this.getUrlPhoto(result),
        rating: this.checkRating(result),
        user_ratings_total : this.getRatingTotal(result),
        vicinity: result.vicinity,
        id: result.id,
        reviews: result.reviews
      })
    },

    pushMarker (result) {
      this.markers.push({
        position: result.geometry.location,
        name: result.name,
        icon: {url: "https://maps.google.com/mapfiles/kml/paddle/grn-circle.png"},
        rating: result.rating,
        vicinity: result.vicinity,
        id: result.id
      })
    },

    
    addRestaurant (e) { // add a new restaurant information in the form, triggered by the clic event
      if (this.places.length > 0) {
        this.addLocation.lat = e.latLng.lat()
        this.addLocation.lng = e.latLng.lng()
        this.add = true
        this.active = -1
        this.tmpLoader = false
      }
    },

    // triggered by emmit from child
    scrollTo (place) { // scroll to selected Element
      setTimeout(() => {
        document.getElementById("placesList").scroll({
        top: !document.getElementById("place-" + place.id) ? 0 : document.getElementById("place-" + place.id).offsetTop - 35,
        left: 0,
        behavior: "smooth"
        })
      }, 100);
    },

    close () { // close the form
      this.add = false
      this.active = 0
      this.tmpLoader = true
    }
  }
}
</script>

<style>

html, body, #app {
  height: 100%;
  margin: 0;
  font-family: 'Oxygen', sans-serif;
}

.marker {
  height: 10px;
  width: 10px;
  background: yellow;
}

.container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: 4fr;
  height: 100%;
}

#info {
  grid-column: 1; grid-row: 1;
}

#mapContainer {
  grid-column: 2; grid-row: 1;
}

.postReview {
  margin-left: 40px;
  display: inherit;
  margin-bottom: 20px;
}

#postButton {
  display: inherit;
  margin-top: 20px;
}

#map {
  height: 100%;
}

#placesList {
  overflow:scroll;
  max-height: 400px;
  min-height: 82%;
}

#review {
  width: 100%;
}

.newPostAutor {
  margin-right: 0;
}

.profilPictureRestaurant {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 200px;
  width: 400px;
  min-width: 100%;
  min-height: 50px;
  max-width: 100%;
  margin-top: 20px;
}

.vicinity {
  margin-top: 10px;
}

.content {
  display: inline;
}

.restaurantName {
  margin-top: 10px;
  margin-bottom: 10px;
  color: black;
  font-size: 1.5em;
  font-weight: 500;
}

.backButton {
  margin-bottom: 10px;
}

</style>
