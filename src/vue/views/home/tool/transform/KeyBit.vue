<script lang="tsx" setup>
defineProps<{ item: any }>();
</script>

<template>
  <div class="item-key">
    <div class="top"></div>
    <div class="front"></div>
    <div class="left side"></div>
    <div class="right side"></div>
    <div class="key-text">{{ item.key }}</div>
  </div>
</template>

<style lang="scss">
.item-key {
  z-index: 1;
  width: 60px;
  height: 70px;
  position: absolute;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transform-origin: 0% 0% -400px;
  transition: 0.2s;

  &.pressed {
    transform: rotateX(-5deg);
  }

  .front {
    width: 60px;
    height: 70px;
    position: relative;
    background: #eee;
    transform: rotateX(0deg);
    border: 1px solid #ccc;
    background-image: linear-gradient(to top bottom, #fff, #eee);
  }

  .top {
    z-index: 9;
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 400px;
    background: #fff;
    border: 1px solid #ccc;
    transform: rotateX(270deg);
    transform-origin: 0% 0%;
    transform-style: preserve-3d;
    background-image: linear-gradient(to bottom right, #eee, #fff);
  }
  .side {
    width: 400px;
    height: 70px;
    top: 0;
    left: 0;
    position: absolute;
    border: 1px solid #ccc;
    transform: rotateY(90deg);
    transform-origin: 0% 0%;
    background-image: linear-gradient(to bottom right, #fff, #999);
    &.left {
      left: 0;
    }
    &.right {
      left: 60px;
    }
  }
  .key-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 70px;
    text-align: center;
    line-height: 70px;
    font-size: 14px;
    color: #333;
  }
}
</style>
