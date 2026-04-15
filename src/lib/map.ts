/*
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2026-01-28 16:52:28
 * @Description: 天地图初始化 + 控件 + 定位
 */
import { message } from "@/vue/utils/message";

// 存储当前定位标记，用于清除旧标记
let currentLocationMarker: T.Marker | null = null;

export function initMap(domId: string) {
  const zoom = 16;
  const map = new T.Map(domId);
  // 设置初始中心点
  const center = new T.LngLat(113.8608014705214, 22.75332286763035);
  map.centerAndZoom(center, zoom);

  // === 添加标准控件 ===
  // 1. 比例尺 (Scale)
  map.addControl(new T.Control.Scale({ position: "bottomright" }));
  
  // 2. 缩放控件 (Zoom)
  map.addControl(new T.Control.Zoom({ position: "bottomright" }));

  // 3. 鹰眼图 (OverviewMap)
  map.addControl(new T.Control.OverviewMap({ isOpen: true, anchor: T_ANCHOR_TOP_RIGHT, position: "topright" }));

  // 4. 地图类型切换 (MapType)
  map.addControl(
    new T.Control.MapType(
      [
        {
          title: "地图",
          icon: "http://api.tianditu.gov.cn/v4.0/image/map/maptype/vector.png",
          layer: TMAP_NORMAL_MAP
        },
        {
          title: "卫星",
          icon: "http://api.tianditu.gov.cn/v4.0/image/map/maptype/satellite.png",
          layer: TMAP_SATELLITE_MAP
        },
        {
          title: "卫星混合",
          icon: "http://api.tianditu.gov.cn/v4.0/image/map/maptype/satellitepoi.png",
          layer: TMAP_HYBRID_MAP
        },
        {
          title: "地形",
          icon: "http://api.tianditu.gov.cn/v4.0/image/map/maptype/terrain.png",
          layer: TMAP_TERRAIN_MAP
        },
        {
          title: "地形混合",
          icon: "http://api.tianditu.gov.cn/v4.0/image/map/maptype/terrainpoi.png",
          layer: TMAP_TERRAIN_HYBRID_MAP
        }
      ],
      {
        position: "topright"
      }
    )
  );

  // === 添加自定义定位按钮 ===
  addLocateButton(map);

  // === 绑定点击事件（可选）===
  map.addEventListener("click", (event: any) => {
    const lnglat = event.lnglat;
    console.log(`经度:  ${lnglat.lng}, 纬度:  ${lnglat.lat}`);
  });
}

// 定位错误消息映射
const errorMsg: Record<number, string> = {
  1: "用户拒绝提供位置信息",
  2: "无法获取当前位置",
  3: "请求超时",
  4: "未知错误"
};

// 定位函数
function locate(map: T.Map) {
  if (!navigator.geolocation) {
    message.error("您的浏览器不支持定位功能");
    return;
  }

  // 清除之前的定位标记
  if (currentLocationMarker) {
    map.removeOverLay(currentLocationMarker);
    currentLocationMarker = null;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const lnglat = new T.LngLat(longitude, latitude);

      // 跳转地图中心
      map.centerAndZoom(lnglat, 16);

      // 添加定位标记
      currentLocationMarker = new T.Marker(lnglat, {
        icon: new T.Icon({
          iconUrl: "https://api.tianditu.gov.cn/v4.0/image/marker/location_dot.png",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      });
      map.addOverLay(currentLocationMarker);
    },
    (error) => {
      console.error("定位失败:", error);
      message.error(errorMsg[error.code] || "定位失败，请重试");
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    }
  );
}

// 添加定位按钮到地图
function addLocateButton(map: T.Map) {
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

  // 绑定点击事件
  button.querySelector("button")!.addEventListener("click", () => {
    locate(map);
  });

  // 将按钮添加到地图容器
  const mapContainer = map.getContainer();
  if (mapContainer) {
    mapContainer.appendChild(button);
  }
}
