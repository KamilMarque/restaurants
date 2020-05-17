<template>
  <div class="list-item" :class='{isExpanded:expanded}'>
    <div v-if="expanded">
      <div class="review-container">
        <div class="info-picture">
          <img class="profil-picture" src="https://fr.vuejs.org/images/logo.png" alt="Profile photo">
        </div>
        <div class="userContainer">
          <div class="autor-name">VueUser</div>
          <star-rating v-bind:star-size="15" v-bind:show-rating="false" @rating-selected="setRating" v-bind:rating=this.rating></star-rating>
        </div>
      </div>
      <div class="post-review">
        <div class="ui form">
          <div class="field">
            <textarea id="new-review" ref="newReview"></textarea>
          </div>
        </div>
        <div v-if="showWarrning" class="ui negative message">
          <i class="close icon" @click.prevent="closeWarrning"></i>
          <div class="header">
            Veillez à attribuer une note.
          </div>
        </div>
        <div class="ui animated button secondary" id="postButton" tabindex="0" @click.prevent="postReview(selectedPlace)">
          <div class="visible content">Ajouter un commentaire</div>
          <div class="hidden content">
            <i class="paper plane icon"></i>
          </div>
        </div>
      </div>
      <div v-for="(review, index) in selectedPlace.reviews" :key="index">
        <div class="review-container">
          <div class="autor-picture">
            <img class="profil-picture" :src="review.profile_photo_url" alt="Profile photo">
          </div>
          <div class="info-autor">
            <div class="autor-name">{{review.author_name}}</div>
            <star-rating v-bind:star-size="15" v-bind:read-only="true" v-bind:rating="review.rating" v-bind:show-rating="false"></star-rating>
            <div class="relative-time">{{review.relative_time_description}}</div>
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
      this.rating = null
    }
  }
}
</script>

<style>
#new-review {
  max-width: 80%;
}

#info-picture {
  grid-column: 1; grid-row: 1;
}


.list-item {
  margin-top: 20px;
}

.review-container {
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-template-rows: 1fr;
  height: 100%;
}

.autor-picture {
  grid-column: 1; grid-row: 1;
}

.info-autor {
  margin-left: 5px;
  grid-column: 2; grid-row: 1;
}

.profil-picture {
  height: 40px;
  width: 40px;
  min-width: 40px;
  min-height: 40px;
  margin-left: 40px;
}

.autor-name {
  font-weight: bold;
}

.post-review {
  margin-left: 40px;
  display: inherit;
  margin-bottom: 20px;
}

.review {
  margin: 20px;
  margin-top: 0;
}

.relative-time {
  font-size: 10px;
  color: dimgray;
  margin-bottom: 20px;
}
</style>
