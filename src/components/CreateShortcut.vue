<template>
  <div id="shortcut-container" v-if="$store.state.isCreatingShortcut">
    <div id="shortcut-form">
      <h2 id="shortcut-form-title">Create shortcut</h2>
      <div id="shortcut-content">
        <div id="shortcut-content-name">
          <span>Shortcut name: </span>
          <input type="text" v-model="name" class="input" />
        </div>
        <div id="shortcut-content-version">
          <span>Version: </span>
          <select v-model="version">
            <option value="1.7">1.7</option>
            <option selected value="1.8.9">1.8.9</option>
            <option value="1.12">1.12</option>
            <option value="1.16">1.16</option>
            <option value="1.17">1.17</option>
            <option value="1.18">1.18</option>
          </select>
        </div>
        <div id="shortcut-content-server">
          <span>Server (optional): </span>
          <input
            placeholder="hypixel.net"
            v-model="server"
            type="text"
            class="input"
          />
        </div>
      </div>
      <div id="shortcut-actions">
        <button
          class="button"
          id="button-cancel"
          @click="
            $store.state.isCreatingShortcut = !$store.state.isCreatingShortcut
          "
        >
          Cancel
        </button>
        <button class="button" id="button-save" @click="_createShortcut()">
          Create shortcut
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { createShortcut } from '../javascript/shortcut';

export default {
  name: 'CreateShortcut',

  data: () => ({
    name: 'Solar Tweaks (shortcut)',
    version: '1.8.9',
    server: null,
  }),

  methods: {
    _createShortcut() {
      createShortcut(this.name, this.version, this.server);
    },
  },
};
</script>

<style scoped>
.input {
  width: 250px;
  height: 10px;
  background-color: #171717;
  border: none;
  outline: none;
  padding: 8px;
  margin: 10px;
  border-radius: 4px;
}

select {
  margin: 10px;
  width: 250px;
  padding: 5px 35px 5px 5px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  outline: none;
  height: 30px;
  appearance: none;
  background-color: #171717;
}

#shortcut-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-top: 110px;
  z-index: 1;
  overflow: hidden;
  background-color: #000000cc;
  text-align: center;
}

#shortcut-form {
  position: fixed;
  background-color: #232324;
  border: 3px solid #30323456;
  height: fit-content;
  padding: 25px;
  z-index: 100;
  width: 60%;
  left: calc((50vw - 50%) * -1);
  top: calc((50vh - 50%) * -1);
  transform: translate(calc(50vw - 50%), calc(50vh - 50%));
  border-radius: 15px;
  justify-content: center;
}

#shortcut-form-title {
  margin-bottom: 15px;
}

#shortcut-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.button {
  background-color: #1f1f1f;
  width: 150px;
  height: 35px;
  border: none;
  box-shadow: 0 0 0 2px #2b2b2b;
  border-radius: 3px;
  transition: background-color 0.5s ease-out;
  font-size: 18px;
  cursor: pointer;
}

#shortcut-actions {
  margin-top: 25px;
}

#button-cancel {
  margin-right: 200px;
}

#button-save {
  margin-left: 200px;
}

#button-cancel:hover {
  background-color: #a22143;
}

#button-save:hover {
  background-color: #269d5f;
}
</style>
