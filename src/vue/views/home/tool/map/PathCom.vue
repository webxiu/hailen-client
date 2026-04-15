<template>
  <div id="map" class="map"></div>
</template>

<script setup>
import { onMounted } from "vue";

let map = null;

onMounted(() => {
  initMap();
  drawRoutes();
});

function initMap() {
  map = new T.Map("map");

  const center = new T.LngLat(116.40769, 39.89945);
  map.centerAndZoom(center, 12);
}

function drawRoutes() {
  const routes = [
    [
      [116.397, 39.909],
      [116.405, 39.915],
      [116.418, 39.92]
    ],
    [
      [116.387, 39.899],
      [116.395, 39.89],
      [116.41, 39.88]
    ]
  ];

  routes.forEach((route, index) => {
    const points = route.map((p) => new T.LngLat(p[0], p[1]));

    const polyline = new T.Polyline(points, {
      color: index === 0 ? "red" : "blue",
      weight: 5,
      opacity: 0.8
    });

    map.addOverLay(polyline);

    addStartEnd(points);
  });
}

function addStartEnd(points) {
  const startMarker = new T.Marker(points[0]);
  const endMarker = new T.Marker(points[points.length - 1]);

  map.addOverLay(startMarker);
  map.addOverLay(endMarker);
}
</script>

<style>
.map {
  width: 100%;
  height: 100vh;
}
</style>
