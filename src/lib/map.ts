import { message } from "@/vue/utils/message";

export function getLocation() {
  const errorMsg: { [key: number | string]: string } = {
    PERMISSION_DENIED: "用户拒绝提供位置信息",
    POSITION_UNAVAILABLE: "无法获取当前位置",
    TIMEOUT: "请求超时",
    UNKNOWN_ERROR: "未知错误",
    3: "请求超时"
  };
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("position", position);
      },
      (error) => {
        console.log("error", error);
        message.error(errorMsg[error.code]);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
}

export function initMap() {
  getLocation();
  const zoom = 12;
  const map = new T.Map("tmap");
  console.log("T", T);
  map.addEventListener("click", (event: any) => {
    var lnglat = event.lnglat;
    const innerText = `经度: ${lnglat.lng}, 纬度: ${lnglat.lat}`;
    console.log("innerText", innerText);
  });
  map.centerAndZoom(new T.LngLat(113.8608014705214, 22.75332286763035), zoom);
}
