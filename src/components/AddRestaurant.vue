<template>
  <section class="" :class='{isAdd:add}'>
    <div v-if="add" class="addNewRestaurant six wide column" >
      <div class="ui segment large form">
        <form action="">                
          <label for="lat">Latitude :</label>
          <input id="lat" type="text" v-model="this.location.lat" disabled>
          <label for="lng">Longitude</label>
          <input id="lng" type="text" v-model="this.location.lng" disabled>
          <label for="name">Nom du restaurant</label>
          <input id="name" type="text" required v-model="name">
           <div v-if="showWarrning" class="ui negative message">
            <i class="close icon" @click.prevent="closeWarrning"></i>
            <div class="header">
              Please enter the restaurant name
            </div>
          </div>
          <div class="field">
            <div class="ui right icon input large">
            <button type="summit" class="add ui button secondary" @click.prevent="addRestaurant" style="margin-top: 20px">Add Restaurants</button>
            <i class="window close outline link icon large" @click="close" style="height: 70px"></i>
            </div> 
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import json from './../json/restaurants.json'

export default {
  props: {
    add: Boolean,
    location: Object,
    places: Array,
    markers: Array,
    google: Object
  },

  data() {
    return {
      name: null, // restaurant name
      showWarrning: false,
      local: {
        lat: this.location.lat,
        lng: this.location.lng
      },
    }
  },

  mounted () {
    let localRestaurants = JSON.parse(JSON.stringify(json))
    this.addRestaurantFromJson(localRestaurants)
  },

  methods: {
    checkDuplicate(completedInfo) { return this.places.find(places => places.id === completedInfo.place_id) },

    async getInfo() { // get vicinity, id and photo from lat lng 
      let infos = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.local.lat},${this.local.lng}&key=AIzaSyAoyHI-r4PMeidsDSnEKuvr4H_LsmzBO-A`)
      let photo = await axios.get(`https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${this.local.lat},${this.local.lng}&heading=70&pitch=0&key=AIzaSyAoyHI-r4PMeidsDSnEKuvr4H_LsmzBO-A`)
      infos.data.results[0].url = photo.config.url
      return infos.data.results[0]
    },

    addRestaurantFromJson (places) {
      for (let i = 0; i < places.length; i++) {
        this.places.push({
          name: places[i].name,
          position: places[i].position,
          reviews: places[i].reviews,
          rating : places[i].rating,
          user_ratings_total: places[i].user_ratings_total,
          url: places[i].url,
          id: places[i].place_id,
          vicinity: places[i].vicinity,
          fromJson: true
        })
        this.addMarkerFromJson(places[i])
      }
    },

    addMarkerFromJson (place) {
      this.markers.push({
        position: place.position,
        name: place.name,
        vicinity: place.vicinity,
        id: place.place_id,
        fromJson: true,
        rating: place.rating,
        icon: {url: "https://maps.google.com/mapfiles/kml/paddle/red-circle.png"}
      })
    },

    async addRestaurant () {
      if (this.name) {
        this.local = {...this.location}
        this.showWarrning = false
        let completedInfo = await this.getInfo()
        if (this.checkDuplicate(completedInfo) === undefined) {
          let name = this.name
          this.places.unshift({
            name: name,
            position: this.local,
            reviews: [],
            rating: 0,
            user_ratings_total: 0,
            url: completedInfo.url,
            id: completedInfo.place_id,
            vicinity: completedInfo.formatted_address
          })
          this.name = null
          this.close()
          this.addMarker(completedInfo, name)
        } else {
          alert ('Duplicated place')
        }
      } else {
        this.showWarrning = true
      }
    },

    addMarker (completedInfo, name) {
      this.local = {...this.location}
      this.markers.push({
        position: this.local,
        icon: { url: 'https://maps.google.com/mapfiles/kml/paddle/orange-circle.png' },
        name: name,
        rating: 0,
        vicinity: completedInfo.formatted_address,
        id: completedInfo.place_id
      })
    },

    close () { // close new resto form
      this.$emit('close')
      this.closeWarrning()
    },
    closeWarrning () { this.showWarrning = false }
  }
}

</script>

<style>
.addNewRestaurant {
    width: auto;
    top: 180px;
    left: 0px;
    margin-bottom: 20px;
}

</style>