<template>
  <div class="listItem" :class='{isExpanded:expanded}'>
    <div class="" v-if="expanded">
      <div class="container">
        <div class="info">
          <img class="profilPicture" src="https://fr.vuejs.org/images/logo.png" alt="Profile photo">
        </div>
        <div class="mapContainer">
          <div class="autorName">VueUser</div>
          <star-rating v-bind:star-size="15" v-bind:show-rating="false" @rating-selected="setRating" v-bind:rating=this.rating></star-rating>
        </div>
      </div>
      <div class="postReview">
        <div class="ui form">
          <div class="field">
            <textarea id="newReview" ref="newReview"></textarea>
          </div>
        </div>
        <div v-if="showWarrning" class="ui negative message">
          <i class="close icon" @click.prevent="closeWarrning"></i>
          <div class="header">
            Please give a rating and a review 
          </div>
        </div>
        <div class="ui animated button secondary" id="postButton" tabindex="0" @click.prevent="postReview(selectedPlace)">
          <div class="visible content">Add Comment</div>
          <div class="hidden content">
            <i class="paper plane icon"></i>
          </div>
        </div>
      </div>
      <div v-for="(review, index) in selectedPlace.reviews" :key="index">
        <div class="reviewContainer">
          <div class="autorPicture">
            <img class="profilPicture" :src="review.profile_photo_url" alt="Profile photo">
          </div>
          <div class="infoAutor">
            <div class="autorName">{{review.author_name}}</div>
            <star-rating v-bind:star-size="15" v-bind:read-only="true" v-bind:rating="review.rating" v-bind:show-rating="false"></star-rating>
            <div class="relativeTime">{{review.relative_time_description}}</div>
          </div>
        </div>
        <div class="review">{{review.text}}</div><br>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from 'vue-star-rating'

export default {
  data() {
    return {
      rating: null,
      showWarrning: false
    }
  },

  props: {
    expanded: Boolean,
    selectedPlace: Object,
    markers: Array
  },

  components: { StarRating },
  watch: {
    expanded () {
        this.$emit('scrollTo')
    }
  },

  methods: {
    closeWarrning () {
      this.showWarrning = false
    },
    setRating (rating){
      this.rating = rating
    },
  
    postReview (place) {
      if (this.$refs.newReview.value && this.rating) {
        place.reviews.unshift({
          author_name: 'VueUser',
          profile_photo_url: 'https://fr.vuejs.org/images/logo.png',
          rating: this.rating,
          text: this.$refs.newReview.value,
          relative_time_description: "aujourd'hui"
        })
        place.user_ratings_total += 1
        this.calcRating(place)
        this.$refs.newReview.value = ''
        this.showWarrning = false
      } else {
        this.showWarrning = true
      }
    },
  
    calcRating (place) { // calc rating with new review
      place.rating = ((place.user_ratings_total - 1) * place.rating + this.rating) / place.user_ratings_total
      this.markers.find(marker => marker.id === place.id).rating = place.rating
      this.rating = null
    }
  }
}
</script>

<style>
.listItem {
  margin-top: 20px;
}

.reviewContainer {
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-template-rows: 1fr;
  height: 100%;
}

.autorPicture {
  grid-column: 1; grid-row: 1;
}

.infoAutor {
  margin-left: 5px;
  grid-column: 2; grid-row: 1;
}

.profilPicture {
  height: 40px;
  width: 40px;
  min-width: 40px;
  min-height: 40px;
  margin-left: 20px;
}

.autorName {
  font-weight: bold;
}

.autorRating {
  color: gray;
}

.review {
  margin: 20px;
  margin-top: 0;
}

.relativeTime {
  font-size: 10px;
  color: dimgray;
  margin-bottom: 20px;
}
</style>
