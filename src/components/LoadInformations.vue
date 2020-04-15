<template>
  <div id="">
      <section id="searchForm">
        <div id="radiusSearch" class="backgroundLoading"></div>
        <div id="starSearch" class="backgroundLoading"></div>
        <div id="buttonsSearch" class="backgroundLoading"></div>
        <div id="locateMe" class="backgroundLoading"></div>
      </section>

      <perfect-scrollbar id="listItems">
        <div id="placeItem">
            <div id="listItemPicture" class="backgroundLoading"></div>
            <div id="listItemName" class="backgroundLoading" style="height: 28px"></div>
            <div id="listItemRating" class="backgroundLoading" style="height: 18px; width: 30%;"></div>
            <div id="listItemRatingTotal" class="backgroundLoading" style="height: 18px; width: 80%;"></div>
            <div id="vicinity" class="backgroundLoading" style="height: 18px; width: 60%"></div>
        </div>
        <div id="placeItem">
            <div id="listItemPicture" class="backgroundLoading"></div>
            <div id="listItemName" class="backgroundLoading" style="height: 28px"></div>
            <div id="listItemRating" class="backgroundLoading" style="height: 18px; width: 30%;"></div>
            <div id="listItemRatingTotal" class="backgroundLoading" style="height: 18px; width: 80%;"></div>
            <div id="vicinity" class="backgroundLoading" style="height: 18px; width: 60%"></div>
        </div>
      </perfect-scrollbar>
  </div>
</template>

<style>
.backgroundLoading {
    background-color: silver;
}
</style>