<template>
  <main id="app">
    <div id="container" class="container">
      <sweet-modal ref="modal" icon="warning">Attention la géolocalisation est désactivée, veuillez l'activer dans les paramètres de votre navigateur.</sweet-modal>
      <transition name='fade'>
      <nav id="informations" v-show="menu" v-if="google">
        <section id="search-form">
          <select id="radius-search" class="ui search dropdown" v-model="radius">
            <option disabled value="">Distance...</option>
            <option value="5">5 KM</option>
            <option value="10">10 KM</option>
            <option value="15">15 KM</option>
            <option value="20">20 KM</option>
          </select>
          <div id="tests">
            <div>
              <star-rating id="starSearch" v-bind:star-size="20" v-model="minRating" :max-rating="maxRating" v-bind:show-rating="false"></star-rating>
              <star-rating id="starSearch2" v-bind:star-size="20" v-model="maxRating" v-bind:show-rating="false"></star-rating>
            </div>
    
            <div id="buttonsSearch">
              <button class="ui button" @click.prevent="resetParams">Reset</button>
              <button class="ui button secondary" @click.prevent="getPlaces">Rechercher</button>
            </div>
            <i class="large location angle left icon" id="hide-menu-button" @click.prevent="hideMenu()"></i>
          </div>
        </section>

        <!-- new restaurent tamplete -->
        <New-Restaurant ref="newRes" v-if="google" :google='google' :places='places' :location='addLocation' :add="add === true"  @close="close"></New-Restaurant>

        <perfect-scrollbar id="listItems">
          <div id="placeItem" class="ui divided items" v-for="(place) in places" :key="place.id">
            <button v-if="active === place.id" class="ui labeled icon button secondary" @click.prevent="closeActivePlace"><i class="left chevron icon"></i>back</button>
            <div :id="'place-' + place.id" v-if="show(place)" ref="target" @click="showReviews(place)">
              <div id="listItemPicture" v-bind:style="{ 'background-image': 'url(' + place.url + ')' }"></div>
              <div id="listItemName" class="restaurantName">{{place.name}}</div>
              <div>
                <star-rating id="listItemRating" v-bind:star-size="15" v-bind:read-only="true" v-bind:rating="place.rating" v-bind:show-rating="false"></star-rating>
                <p id="listItemRatingTotal">({{place.user_ratings_total}})</p>
              </div>
              <div id="vicinity">{{place.vicinity}}</div>
            </div>
            <list-item :selected-place='place' :expanded="active === place.id" @scrollTo="scrollTo(place)"></list-item>
          </div>
        </perfect-scrollbar>
      </nav>
      <load-informations v-else> </load-informations>
      </transition>
      <i v-if="!menu" class="large location angle right icon" id="showMenuButtom" @click.prevent="showMenu()"></i>
      <i class="large location arrow link icon" id="locateMe" @click.prevent="panTo(center)"></i>

      <section id="mmap">
        <GmapMap  id="map" ref="mapRef" :center="{lat: this.center.lat, lng: this.center.lng}" :zoom="17"  map-type-id="roadmap" @click="addRestaurant">
          <gmap-marker class="marker" :key="index" v-for="(m, index) in markersFilter" :icon="m.icon" :position="m.position" :zIndex='m.zIndex' @click="showReviews(m)"></gmap-marker>
        </GmapMap>
      </section>
    </div>
  </main>
</template>

<script>
import { gmapApi } from 'vue2-google-maps'
import axios from 'axios'
import ListItem from './components/ListItem'
import LoadInformations from './components/LoadInformations.vue'
import StarRating from 'vue-star-rating'
import NewRestaurant from './components/AddRestaurant'


export default {
  name: 'GoogleMap',
  components: { ListItem, NewRestaurant, StarRating, LoadInformations},
  data () {
    return {
      service: null,
      isSearching: false, // check if user is searching restaurants 
      minRating: 0,
      maxRating: 5,
      menu: true,
      active: 0, // take the place.id whitch the user clicked on
      add: false, // allow to show the new resto form
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
    }
  },
  mounted () {
    this.geolocate()
    // set the service with goolge places api
    this.$refs.mapRef.$mapPromise.then((map) => { this.service = new this.google.maps.places.PlacesService(map) })
  },

  computed: {
    // store the google map import
    google: gmapApi,
    markersFilter () {
      return this.minRating > 0 ? this.places.filter(i => (i.rating + 0.9 >= this.minRating && i.rating <= this.maxRating) || i.name === 'Votre position') : this.places
     },
  },

  methods: {
    // left menu
    hideMenu () {
     document.getElementById('container').classList.remove('container')
     document.getElementById('container').classList.add('container-responsive')
      this.menu = false
    },
    showMenu () {
      document.getElementById('container').classList.remove('container-responsive')
      document.getElementById('container').classList.add('container')
      this.menu = true
    },

    // should I show restaurant in the list
    show (place) { return ((this.active === place.id || this.active === 0) && ((place.rating + 0.9 >= this.minRating && place.rating <= this.maxRating) || this.active === place.id)) ? true : false },

    resetParams () { this.minRating = 0; this.maxRating = 5; this.radius = 5 },


    // géolocation functions
    geolocate () {
      navigator.geolocation.getCurrentPosition(this.succesGeolocate, this.errorGeolocate);
    },

    succesGeolocate (pos) {
      this.center = { lat: parseFloat(pos.coords.latitude), lng: parseFloat(pos.coords.longitude) }
      this.pushCurrentPlaceMarker() 
    },

    errorGeolocate () {
      this.$refs.modal.open();
      this.pushCurrentPlaceMarker()
    },

    pushCurrentPlaceMarker () {
      this.places.push({
        position: this.center,
        name: 'Votre position',
        icon: {url: "https://maps.google.com/mapfiles/kml/paddle/blu-blank.png"},
        zIndex: 1
      })
    },

    // zoom in on the place
    panTo (place) {
      this.$refs.mapRef.$mapPromise.then((map) => {
        map.panTo(place)
        map.setZoom(15)
      })
    },

    activePin (place) {
      let tmp = place.icon.url.split('-')
      place.icon = {url : tmp[0] + "-circle.png", scaledSize: new this.google.maps.Size(75, 75)}
      place.zIndex = 2
      this.active = place.id
    },

    closeActivePlace () {
      let place =  this.places.filter(place => place.id === this.active)[0]
      let tmp = place.icon.url.split('-')
      place.icon = {url : tmp[0] + "-blank.png", scaledSize: new this.google.maps.Size(50, 50)}
      place.zIndex = 1
      this.active = 0
    },

    showReviews (place) {
      if (place.name != 'Votre position') {
        if (this.active != 0) {this.closeActivePlace()}
        this.activePin(place)
        this.panTo(place.position)
      }
    },

    checkRating (result) { return !result.rating ? 0 : result.rating },
    getRatingTotal (result) { return !result.user_ratings_total ? 0 : result.user_ratings_total },
    getUrlPhotoFromStreetView (location) { return axios.get(`https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${location.lat()},${location.lng()}&heading=70&pitch=0&key=${process.env.VUE_APP_SECRET_KEY}`) },
    
    async getUrlPhoto (result) {
      if (result.photos) { return (result.photos[0].getUrl()) }
      else {
        let res = await this.getUrlPhotoFromStreetView(result.geometry.location)
        return (res.config.url)
      }
    },

    async getReviews (result) {
      const URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=reviews&key=${process.env.VUE_APP_SECRET_KEY}`
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
        this.isSearching = true
        this.add = false
        this.clearPlaces()
        this.service.nearbySearch(request, async (results, status) => {
          if (status === this.google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
              results[i].reviews = []
              let res = await this.getReviews(results[i])
              results[i].reviews = res.data.result.reviews ? res.data.result.reviews : []
              this.pushPlace(results[i])
              
            }
            this.isSearching = false
          }
        })
      }
    },

    clearPlaces () {
      for (let i = 0; i < this.places.length; i++) {
        if (this.places[i].notDeletable != true && this.places[i].name  != 'Votre position') {
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
        icon: {url: "https://maps.google.com/mapfiles/kml/paddle/grn-blank.png", scaledSize: new this.google.maps.Size(50, 50)},
        zIndex: 1,
        reviews: result.reviews
      })
    },
    
    addRestaurant (e) { // add a new restaurant information in the form, triggered by the clic event
      if (this.active != 0) {this.closeActivePlace()}
      this.addLocation.lat = e.latLng.lat()
      this.addLocation.lng = e.latLng.lng()
      this.add = true
      this.showMenu()
    },

    // triggered by emmit from child
    scrollTo (place) { // scroll to selected Element
      setTimeout(() => {
        document.getElementById("listItems").scroll({
        top: !document.getElementById("place-" + place.id) ? 0 : document.getElementById("place-" + place.id).offsetTop - 65,
        left: 0,
        })
      }, 100);
    },

    close () { // close the form
      this.add = false
    }
  }
}
</script>

<style>
html, #app {
  height: 100%;
  margin: 0;
  font-family: 'Oxygen', sans-serif;
}

.container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 470px auto;
}

.container-responsive {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 100%;
}

#mmap {
  background-color: gray;
}

#search-form {
  box-shadow: 0px 10px 25px grey;
  height: 15%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

#radius-search {
  margin: 1em;
  grid-row: 1;
  grid-column: 1 / 5;
}

#tests {
  position: relative;
  margin: 1em;
  grid-row: 2;
  grid-column: 1 / 5;
}

#starSearch #starSearch2 {
  margin: 1em;
  grid-row: 2;
  grid-column: 1 / 3;
}

#buttonsSearch {
  position: absolute;
  right: 1em;
  top: 0;
  /* margin: 1em;
  grid-row: 2;
  grid-column: 4 / 5; */
}

#listItems {
    position: absolute;
    max-width: 470px;
    min-width: 470px;
    height: 85%;
}

#placeItem {
    margin: 15px;
    grid-row: 1;
    grid-column: 1 / 4;
}

#listItemPicture {
    background-color: silver;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    height: 200px;
    min-width: 100%;
}

#listItemName {
  margin: 10px 0px 10px 10px;
  color: black;
  font-size: 1.5em;
  font-weight: 500;
}

#listItemRating {
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle
}

#listItemRatingTotal {
  display: inline;
}

#vicinity {
  margin-left: 10px;
}

#map {
  height: 100%;
}

#hide-menu-button {
  position: relative;
  background-color: white;
  line-height: 40px;
  height: 40px;
  left: 455px;
  top: -60px;
  z-index: 1;
}

#showMenuButtom {
  position: absolute;
  background-color: white;
  top: 60px;
  line-height: 40px;
  height: 40px;
  z-index: 1;
}

.postReview {
  margin-left: 40px;
  display: inherit;
  margin-bottom: 20px;
}

#review {
  width: 100%;
}

.newPostAutor {
  margin-right: 0;
}

.sweet-modal .sweet-box-actions .sweet-action-close:hover {
  background: #1b1c1d !important;
}

.sweet-modal-overlay {
  background: none !important;
}

.button {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}

#locateMe {
  position: fixed;
  background-color: white;
  right: 5px;
  top: 8%;
  height: 50px;
  line-height: 50px;
  width: 50px;
  border-radius: 50px;
  z-index: 1;
}

@media screen and (max-width: 600px) {
  #listItems {
    max-width: 300px;
    min-width: 300px;
    height: 80%;
  }
  .container {
    grid-template-columns: 300px auto;
  }

  #radius-search {
    height: 30px;
    margin-top: 5px;
    margin-bottom: 0px;
  }

  #search-form {
    height: 20%;
    grid-template-rows: repeat(3, 1fr);
  }

  #hide-menu-button {
  left: 285px;
  top: -35px;
  z-index: 1;
}

  #starSearch #starSearch2{
    margin: 0px 0px 0px 20px;
  grid-row: 2;
  grid-column: 1 / 3;
}

#buttonsSearch {
  margin: 0px 0px 0px 20px;
  grid-row: 3;
  grid-column: 1 / 4;
  right: auto;
  left: auto;
  top: 4em;
}

}
</style>
