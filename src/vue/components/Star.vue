<template>
    <div class="star-space">
      <div class="flow-star" />
      <div class="flow-star" />
      <div class="flow-star" />
      <div class="flow-star" />
      <div class="flow-star" />
      <div class="flow-star" />
    </div>
  </template>
  
  <style scoped>
  .star-space,
  .flow-star {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: -1;
  }
  
  .flow-star {
    background-image: radial-gradient(2px 2px at 50px 200px, #68ff03, rgb(0 0 0 / 0%)), radial-gradient(2px 2px at 40px 70px, #fff, rgb(0 0 0 / 0%)),
      radial-gradient(3px 4px at 120px 40px, #2806e9, rgb(0 0 0 / 0%));
    background-repeat: repeat;
    background-size: 250px 250px;
    opacity: 0;
    animation: zoom 10s infinite;
  }
  
  .flow-star:nth-child(1) {
    background-position: 10% 90%;
    animation-delay: 0s;
  }
  
  .flow-star:nth-child(2) {
    background-position: 20% 50%;
    background-size: 270px 500px;
    animation-delay: 0.3s;
  }
  
  .flow-star:nth-child(3) {
    background-position: 40% -80%;
    animation-delay: 1.2s;
  }
  
  .flow-star:nth-child(4) {
    background-position: -20% -30%;
    transform: rotate(60deg);
    animation-delay: 2.5s;
  }
  
  .flow-star:nth-child(5) {
    background-image: radial-gradient(2px 2px at 10px 100px, #eee, rgb(0 0 0 / 0%)), radial-gradient(2px 2px at 20px 10px, #fff, rgb(0 0 0 / 0%)),
      radial-gradient(3px 4px at 150px 40px, #ddd, rgb(0 0 0 / 0%));
    background-position: 80% 30%;
    animation-delay: 4s;
  }
  
  .flow-star:nth-child(6) {
    background-position: 50% 20%;
    animation-delay: 6s;
  }
  
  @keyframes zoom {
    0% {
      opacity: 0;
      transform: scale(0.5);
      transform: rotate(5deg);
      animation-timing-function: ease-in;
    }
  
    85% {
      opacity: 1;
    }
  
    100% {
      opacity: 0.2;
      transform: scale(2.2);
    }
  }
  
  @media (prefers-reduced-motion) {
    .flow-star {
      animation: none;
    }
  }
  </style>
  