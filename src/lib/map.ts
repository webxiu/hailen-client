/*
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2026-01-28 16:52:28
 * @Description: 天地图初始化 + 控件 + 定位
 */

import { message } from "@/vue/utils/message";

const PositionIcon = `http://api.tianditu.gov.cn/v4.0/image/marker-icon.png`;
const location_dot = "https://api.tianditu.gov.cn/v4.0/image/marker/location_dot.png";
// 定位错误消息映射
const errorMsg: Record<number, string> = {
  1: "定位未开启或拒绝位置请求",
  2: "无法获取当前位置",
  3: "获取位置超时",
  4: "未知错误"
};

export function initMap(domId: string) {
  const zoom = 16;
  const map = new T.Map(domId);
  let currentMarker: T.Marker | null = null;
  const center = new T.LngLat(114.05434, 22.54647);
  reverseGeocode({ lnglat: center, isCenter: true });
  getLocation(); // 获取当前位置

  // ****************** 添加标准控件 ******************

  // 1. 比例尺 (Scale)
  map.addControl(new T.Control.Scale({ position: "bottomright" }));

  // 2. 缩放控件 (Zoom)
  map.addControl(new T.Control.Zoom({ position: "bottomright" }));

  // 3. 鹰眼图 (OverviewMap)
  map.addControl(new T.Control.OverviewMap({ isOpen: true, anchor: T_ANCHOR_TOP_RIGHT, position: "topright" }));

  // 4. 地图类型切换 (MapType)
  const mapTypeList = [
    {
      title: "地图",
      icon: "https://api.tianditu.gov.cn/v4.0/image/map/maptype/vector.png",
      layer: TMAP_NORMAL_MAP
    },
    {
      title: "卫星",
      icon: "https://api.tianditu.gov.cn/v4.0/image/map/maptype/satellite.png",
      layer: TMAP_SATELLITE_MAP
    },
    {
      title: "卫星混合",
      icon: "https://api.tianditu.gov.cn/v4.0/image/map/maptype/satellitepoi.png",
      layer: TMAP_HYBRID_MAP
    },
    {
      title: "地形",
      icon: "https://api.tianditu.gov.cn/v4.0/image/map/maptype/terrain.png",
      layer: TMAP_TERRAIN_MAP
    },
    {
      title: "地形混合",
      icon: "https://api.tianditu.gov.cn/v4.0/image/map/maptype/terrainpoi.png",
      layer: TMAP_TERRAIN_HYBRID_MAP
    }
  ];
  map.addControl(new T.Control.MapType(mapTypeList, { position: "topright" }));

  // 5.添加定位按钮
  addLocateButton();

  // 6.绑定点击事件（可选）
  map.addEventListener("click", (event: any) => {
    const lnglat = event.lnglat;
    console.log(`经度:  ${lnglat.lng}, 纬度:  ${lnglat.lat}`);
    reverseGeocode({ lnglat, isCenter: false });
  });

  // 7.添加定位标记
  function addLocateMarker(lnglat, isCenter = false) {
    console.log("添加定位标记", lnglat);
    if (isCenter) map.centerAndZoom(lnglat, zoom - 4); // 移动地图中心
    if (currentMarker) map.removeOverLay(currentMarker);
    const size = 20;
    currentMarker = new T.Marker(lnglat, {
      icon: new T.Icon({
        iconUrl: PositionIcon,
        iconSize: [size, null],
        iconAnchor: [size / 2, size + size / 2]
      })
    });
    map.addOverLay(currentMarker);
  }
  // 8.获取当前位置
  function getLocation() {
    addLocateMarker(center, true); // 初始中心点
    if (!navigator.geolocation) {
      return message.error("无法获取地理位置");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lnglat = new T.LngLat(longitude, latitude);
        reverseGeocode({ lnglat, isCenter: true });
      },
      (error) => {
        console.error("定位失败:", error);
        message.error(errorMsg[error.code] || "定位失败");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  // 9.添加定位按钮
  function addLocateButton() {
    // 创建按钮 DOM
    const button = document.createElement("div");
    button.innerHTML = `
    <button style="
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: #1890ff;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    ">📍</button>
  `;
    button.style.position = "absolute";
    button.style.bottom = "10%";
    button.style.left = "10px";
    button.style.zIndex = "1000";

    // 将按钮添加到地图容器
    const mapContainer = map.getContainer();
    if (mapContainer) {
      mapContainer.appendChild(button);
    }
    button.querySelector("button")!.addEventListener("click", () => {
      getLocation();
    });
  }

  // 逆地理编码获取地址
  function reverseGeocode(param) {
    const { lnglat, isCenter = false } = param;
    addLocateMarker(lnglat, isCenter);
    const geoCoder = new T.Geocoder();
    geoCoder.getLocation(lnglat, (result) => {
      console.log("result:", result.formatted_address, result);
      if (+result.status === 0) {
        const address = result.formatted_address;
      } else {
        message.error(result.message || "获取地址失败");
      }
    });
  }
}
