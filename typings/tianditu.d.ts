// src/types/tianditu.d.ts

declare namespace T {
  // 地图类
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions);
    centerAndZoom(lnglat: LngLat, zoom: number): void;
    addControl(control: Control): void;
    removeOverLay(overlay: Overlay): void;
    addOverLay(overlay: Overlay): void;
    getContainer(): HTMLElement;
    getBounds(): Bounds;
    addEventListener(event: string, handler: (e: any) => void): void;
  }

  // 经纬度
  class LngLat {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
  }

  // 覆盖物基类
  class Overlay {}

  // 标记
  class Marker extends Overlay {
    constructor(lnglat: LngLat, options?: MarkerOptions);
  }

  interface MarkerOptions {
    icon?: Icon;
  }

  class Icon {
    constructor(options: IconOptions);
  }

  interface IconOptions {
    iconUrl: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }

  // 边界
  class Bounds {
    getSouthWest(): LngLat;
    getNorthEast(): LngLat;
  }

  // 控件基类
  class Control {}

  // 缩放控件
  class Zoom extends Control {
    constructor(options?: ControlOptions);
  }

  // 比例尺
  class Scale extends Control {
    constructor(options?: ControlOptions);
  }

  // 鹰眼图
  class OverviewMap extends Control {
    constructor(options?: OverviewMapOptions);
  }

  // 地图类型控件
  class MapType extends Control {
    constructor(mapTypes: MapTypeItem[], options?: ControlOptions);
  }

  interface MapTypeItem {
    title: string;
    icon: string;
    layer: MapTypeLayer;
  }

  type MapTypeLayer = typeof window.TMAP_NORMAL_MAP | typeof window.TMAP_SATELLITE_MAP | typeof window.TMAP_HYBRID_MAP;

  // 控件通用选项
  interface ControlOptions {
    position?: number; // 使用 T_ANCHOR_XXX 常量
  }

  interface OverviewMapOptions extends ControlOptions {
    isOpen?: boolean;
    anchor?: number;
  }

  interface MapOptions {
    projection?: string;
  }
}

// 声明全局变量 T
declare const T: typeof T;

// 声明天地图全局常量（用于 MapType.layer）
declare const TMAP_NORMAL_MAP: T.MapTypeLayer;
declare const TMAP_SATELLITE_MAP: T.MapTypeLayer;
declare const TMAP_HYBRID_MAP: T.MapTypeLayer;
declare const TMAP_TERRAIN_MAP: T.MapTypeLayer;
declare const TMAP_TERRAIN_HYBRID_MAP: T.MapTypeLayer;

// 声明锚点常量（用于 position）
declare const T_ANCHOR_TOP_LEFT: number;
declare const T_ANCHOR_TOP_RIGHT: number;
declare const T_ANCHOR_BOTTOM_LEFT: number;
declare const T_ANCHOR_BOTTOM_RIGHT: number;
