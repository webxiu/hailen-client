import ETFGrid from "./etf";
import React from "react";

function Hello() {
  const [active, setActive] = React.useState(0);
  const bannerList = [
    { id: 1, name: "轮播图1", color: "red" },
    { id: 2, name: "轮播图2", color: "blue" },
    { id: 3, name: "轮播图3", color: "green" },
    { id: 4, name: "轮播图4", color: "yellow" },
    { id: 5, name: "轮播图5", color: "black" }
  ];

  const onClick = (item, index) => {
    console.log("111", index);
    if (index >= bannerList.length - 1) {
      return setActive(0);
    }
    setActive(index + 1);
  };
  return (
    <div>
      轮播图布局
      <div
        className="banner-container "
        style={{
          position: "relative",
          width: "100%",
          height: "200px",
          overflow: "hidden",
          marginBottom: "20px"
        }}
      >
        {bannerList.map((item, index) => (
          <div
            className="banner-item"
            key={item.id}
            onClick={() => onClick(item, index)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: item.color,
              display: index === active ? "block" : "none",
              transition: "display 1s ease-in-out"
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <div style={{ width: "100%", height: "100%" }}>
        <ETFGrid />
      </div>
    </div>
  );
}

export default Hello;
