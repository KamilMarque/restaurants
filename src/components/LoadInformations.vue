<template>
  <div id="">
      <section id="searchForm">
        <div id="radiusSearch" class="background-loading"></div>
        <div id="starSearch" class="background-loading"></div>
        <div id="buttonsSearch" class="background-loading"></div>
        <div id="locateMe" class="background-loading"></div>
      </section>

      <perfect-scrollbar id="listItems">
        <div id="placeItem">
            <div id="listItemPicture" class="background-loading"></div>
            <div id="listItemName" class="background-loading" style="height: 28px"></div>
            <div id="listItemRating" class="background-loading" style="height: 18px; width: 30%;"></div>
            <div id="listItemRatingTotal" class="background-loading" style="height: 18px; width: 80%;"></div>
            <div id="vicinity" class="background-loading" style="height: 18px; width: 60%"></div>
        </div>
        <div id="placeItem">
            <div id="listItemPicture" class="background-loading"></div>
            <div id="listItemName" class="background-loading" style="height: 28px"></div>
            <div id="listItemRating" class="background-loading" style="height: 18px; width: 30%;"></div>
            <div id="listItemRatingTotal" class="background-loading" style="height: 18px; width: 80%;"></div>
            <div id="vicinity" class="background-loading" style="height: 18px; width: 60%"></div>
        </div>
      </perfect-scrollbar>
  </div>
</template>

<style>
.background-loading {
    background-color: silver;
}
</style>