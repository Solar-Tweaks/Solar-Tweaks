<template>
  <div class="card">
    <div
      class="card-header"
      :style="`background-image: url('${require(`@/assets/cards-backgrounds/${background}.png`)}')`"
    >
      <div class="card-header-container">
        <div class="card-title-container">
          <i :class="icon" class="card-icon"></i>
          <h1 class="card-title">{{ title }}</h1>
        </div>
        <h4 class="card-subtitle">{{ subtitle }}</h4>
      </div>
    </div>
    <div :class="['card-content', contentClass]">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: ['icon', 'title', 'subtitle', 'background', 'contentClass'],
};
</script>

<style scoped>
.card {
  width: 90%;
  height: auto;
}

.card-header {
  width: 100%;
  height: 100px;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  background-repeat: no-repeat;
  background-size: cover;
}

.card-header-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  padding-top: 22px;
}

.card-title-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-icon {
  font-size: 25px;
  margin-right: 10px;
}

.card-title {
  font-weight: 200;
  font-size: 25px;
}

.card-subtitle {
  font-weight: 100;
  font-size: 15px;
  letter-spacing: 1px;
  margin-top: 2px;
}

.card-content {
  height: auto;
  background-color: #201f1d;
  border-bottom-right-radius: 15px;
  border-bottom-left-radius: 15px;
  overflow: hidden;
  display: flex;
}
</style>
