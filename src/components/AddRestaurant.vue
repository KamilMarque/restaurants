<template>
  <section class="" :class='{isAdd:add}'>
      <sweet-modal ref="modal" icon="error">Il existe déjà un restaurant à cet endroit</sweet-modal>
      <sweet-modal ref="succes" icon="success">Restaurant ajouté !</sweet-modal>
      <sweet-modal ref="newRestaurant" @close="close('html')">
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
                Nom du restaurant obligatoire
              </div>
            </div>
            <div class="field">
              <div class="ui right icon input large">
                <button type="summit" class="add ui button secondary" @click.prevent="addRestaurant" style="margin-top: 20px">Ajouter le restaurant</button>
              </div> 
            </div>
          </form>
        </div>
      </sweet-modal>
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

  watch: {
    async add () {
      if (this.add) { this.$refs.newRestaurant.open() }
    },
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
          icon: {url: "https://maps.google.com/mapfiles/kml/paddle/red-blank.png", scaledSize: new this.google.maps.Size(50, 50)},
          zIndex: 1,
          fromJson: true
        })
      }
    },

    async addRestaurant () {
      if (this.name) {
        this.local = {...this.location}
        this.showWarrning = false
        let completedInfo = await this.getInfo()
        if (this.checkDuplicate(completedInfo) === undefined) {
          let name = this.name
          this.addPlace(completedInfo, name, this.local)
          this.name = null
          this.$refs.succes.open()
        } else {
            this.$refs.modal.open()
        }
      this.close('js');
      } else {
        this.showWarrning = true
      }
    },

    addPlace (completedInfo, name, local) {
      this.places.unshift({
        name: name,
        position: local,
        icon: { url: 'https://maps.google.com/mapfiles/kml/paddle/orange-blank.png', scaledSize: new this.google.maps.Size(50, 50) },
        reviews: [],
        rating: 0,
        user_ratings_total: 0,
        url: completedInfo.url,
        id: completedInfo.place_id,
        vicinity: completedInfo.formatted_address
      })
    },

    close (from) { // close new resto form
    if (from != 'html') { this.$refs.newRestaurant.close() }
      this.closeWarrning()
      this.$emit('close') 
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