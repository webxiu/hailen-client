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
  const geometry = [
    { lat: 22.5452644, lon: 113.9115873 },
    { lat: 22.545403, lon: 113.9114468 },
    { lat: 22.5455571, lon: 113.9113071 },
    { lat: 22.5457143, lon: 113.911178 },
    { lat: 22.5458773, lon: 113.9110597 },
    { lat: 22.5460688, lon: 113.9109255 },
    { lat: 22.5461863, lon: 113.91085 },
    { lat: 22.5463123, lon: 113.9107733 },
    { lat: 22.5464124, lon: 113.9107155 },
    { lat: 22.5469044, lon: 113.9104392 },
    { lat: 22.5475475, lon: 113.9100844 },
    { lat: 22.5480373, lon: 113.9098141 },
    { lat: 22.5485809, lon: 113.9095517 },
    { lat: 22.5491406, lon: 113.9092586 },
    { lat: 22.549719, lon: 113.9089758 }
  ];
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
    ],
    ...geometry.map((p) => [p.lon, p.lat])
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
