"use client";

// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-quartz.css";

import { ClientSideRowModelModule, DateFilterModule, ModuleRegistry, NumberFilterModule, TextFilterModule, ValidationModule, createGrid } from "ag-grid-community";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, FiltersToolPanelModule, MultiFilterModule, PivotModule, SetFilterModule } from "ag-grid-enterprise";
import React, { StrictMode, useCallback, useMemo, useRef, useState } from "react";

import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  PivotModule,
  FiltersToolPanelModule,
  MultiFilterModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ValidationModule /* Development Only */
]);

const filterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    const dateAsString = cellValue;
    if (dateAsString == null) return -1;
    const dateParts = dateAsString.split("/");
    const cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  }
};

const GridExample = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "800px" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [rowData, setRowData] = useState();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "country",
      headerName: "国家",
      valueFormatter: (params) => params.value,
      filter: "agSetColumnFilter",
      enablePivot: true,
      hide: false,
      rowGroup: true,
      enableRowGroup: true
    },
    { field: "gold", headerName: "金牌", filter: "agSetColumnFilter", aggFunc: "sum", enableValue: true },
    { field: "silver", headerName: "银牌", filter: "agSetColumnFilter", aggFunc: "sum", enableValue: true },
    { field: "bronze", headerName: "铜牌", filter: "agSetColumnFilter", aggFunc: "sum", enableValue: true },
    { field: "sport", headerName: "运动", filter: "agSetColumnFilter", enablePivot: true },
    { field: "date", headerName: "日期", enablePivot: true, filter: "agDateColumnFilter", filterParams: filterParams },
    { field: "age", headerName: "年龄", enablePivot: true },
    { field: "athlete", headerName: "运动员", enablePivot: true },
    { field: "year", headerName: "年份", enablePivot: true },
    { field: "total", headerName: "总数", aggFunc: "sum", filter: false, enableValue: true }
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: "agTextColumnFilter",
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true
    };
  }, []);
  const autoGroupColumnDef = useMemo(() => {
    return { minWidth: 200 };
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    //   .then((resp) => resp.json())
    //   .then((data) => setRowData(data));
    const data: any = [
      { athlete: "迈克尔·菲尔普斯", age: 23, country: "美国", year: 2008, date: "2008/08/24", sport: "游泳", gold: 8, silver: 0, bronze: 0, total: 8 },
      { athlete: "迈克尔·菲尔普斯", age: 19, country: "美国", year: 2004, date: "2004/08/29", sport: "游泳", gold: 6, silver: 0, bronze: 2, total: 8 },
      { athlete: "迈克尔·菲尔普斯", age: 27, country: "美国", year: 2012, date: "2012/08/12", sport: "游泳", gold: 4, silver: 2, bronze: 0, total: 6 },
      { athlete: "娜塔莉·考夫林", age: 25, country: "美国", year: 2008, date: "2008/08/24", sport: "游泳", gold: 1, silver: 2, bronze: 3, total: 6 },
      { athlete: "阿列克谢·涅莫夫", age: 24, country: "俄罗斯", year: 2000, date: "2000/10/01", sport: "体操", gold: 2, silver: 1, bronze: 3, total: 6 },
      { athlete: "艾丽西亚·考茨", age: 24, country: "澳大利亚", year: 2012, date: "2012/08/12", sport: "游泳", gold: 1, silver: 3, bronze: 1, total: 5 },
      { athlete: "米西·富兰克林", age: 17, country: "美国", year: 2012, date: "2012/08/12", sport: "游泳", gold: 4, silver: 0, bronze: 1, total: 5 },
      { athlete: "瑞安·罗切特", age: 27, country: "美国", year: 2012, date: "2012/08/12", sport: "游泳", gold: 2, silver: 2, bronze: 1, total: 5 },
      { athlete: "艾莉森·施密特", age: 22, country: "美国", year: 2012, date: "2012/08/12", sport: "游泳", gold: 3, silver: 1, bronze: 1, total: 5 },
      { athlete: "娜塔莉·考夫林", age: 21, country: "美国", year: 2004, date: "2004/08/29", sport: "游泳", gold: 2, silver: 2, bronze: 1, total: 5 },
      { athlete: "伊恩·索普", age: 17, country: "澳大利亚", year: 2000, date: "2000/10/01", sport: "游泳", gold: 3, silver: 2, bronze: 0, total: 5 },
      { athlete: "达拉·托雷斯", age: 33, country: "美国", year: 2000, date: "2000/10/01", sport: "游泳", gold: 2, silver: 0, bronze: 3, total: 5 },
      { athlete: "辛迪·克拉斯森", age: 26, country: "加拿大", year: 2006, date: "2006/02/26", sport: "速度滑冰", gold: 1, silver: 2, bronze: 2, total: 5 },
      { athlete: "娜斯佳·柳金", age: 18, country: "美国", year: 2008, date: "2008/08/24", sport: "体操", gold: 1, silver: 3, bronze: 1, total: 5 },
      { athlete: "玛丽特·比约根", age: 29, country: "挪威", year: 2010, date: "2010/02/28", sport: "越野滑雪", gold: 3, silver: 1, bronze: 1, total: 5 },
      { athlete: "孙杨", age: 20, country: "中国", year: 2012, date: "2012/08/12", sport: "游泳", gold: 2, silver: 1, bronze: 1, total: 4 },
      { athlete: "柯丝蒂·考文垂", age: 24, country: "津巴布韦", year: 2008, date: "2008/08/24", sport: "游泳", gold: 1, silver: 3, bronze: 0, total: 4 },
      { athlete: "利比·伦顿-特里克特", age: 23, country: "澳大利亚", year: 2008, date: "2008/08/24", sport: "游泳", gold: 2, silver: 1, bronze: 1, total: 4 },
      { athlete: "瑞安·罗切特", age: 24, country: "美国", year: 2008, date: "2008/08/24", sport: "游泳", gold: 2, silver: 0, bronze: 2, total: 4 },
      { athlete: "英格·德布鲁因", age: 30, country: "荷兰", year: 2004, date: "2004/08/29", sport: "游泳", gold: 1, silver: 1, bronze: 2, total: 4 },
      { athlete: "佩特里亚·托马斯", age: 28, country: "澳大利亚", year: 2004, date: "2004/08/29", sport: "游泳", gold: 3, silver: 1, bronze: 0, total: 4 }
    ];
    setRowData(data);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={gridStyle}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            sideBar={["columns", "filters"]}
            pivotMode={true}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
  );
};

export default GridExample;
