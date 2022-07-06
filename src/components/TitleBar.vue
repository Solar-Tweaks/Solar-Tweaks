<template>
  <div id="fixed-container">
    <div id="title-bar-container">
      <img
        src="@/assets/logo-gray.svg"
        id="title-image"
        alt="Solar Tweaks Logo"
        class="logo-white"
        height="50"
        width="50"
      />
      <h2 id="title">Solar Tweaks</h2>
      <div id="nav-container">
        <ul id="nav">
          <li v-for="link in links" v-bind:key="link.name" class="nav-item">
            <button
              class="nav-btn"
              :disabled="link.active"
              @click="setActiveTab(link.name)"
            >
              {{ link.name }}
            </button>
          </li>
        </ul>
      </div>
      <div id="button-container">
        <button
          class="titlebar-button"
          id="shortcut-btn"
          @click="createShortcut()"
        >
          <i class="fa-solid fa-share-from-square titlebar-button-icon"></i>
        </button>
        <button class="titlebar-button" id="close-btn" @click="closeWindow()">
          <i class="fa-solid fa-xmark fa-2x titlebar-button-icon"></i>
        </button>
      </div>
    </div>
  </div>
  <CreateShortcut />
</template>

<script>
import CreateShortcut from './CreateShortcut.vue';
import { remote } from 'electron';

export default {
  name: 'TitleBar',

  components: {
    CreateShortcut,
  },

  data: () => ({
    links: [
      {
        name: 'Home',
        active: false,
      },
      {
        name: 'Servers',
        active: false,
      },
      {
        name: 'Patcher',
        active: false,
      },
      {
        name: 'Settings',
        active: false,
      },
      {
        name: 'About',
        active: false,
      },
    ],
  }),

  methods: {
    /**
     * Close the window
     */
    closeWindow() {
      remote.getCurrentWindow().close();
    },

    /**
     * Set the active tab
     * @param {string} tabName The name of the tab to set as active
     */
    setActiveTab(tabName) {
      this.$store.commit('setActiveTab', tabName);
      this.links.find((link) => link.active).active = false;
      this.links.find((link) => link.name === tabName).active = true;

      if (tabName === 'Home') {
        this.$store.commit('setPlayContainerHeight', 300);
      } else this.$store.commit('setPlayContainerHeight', 135);
    },

    /**
     * Open the shortcut creation window
     */
    createShortcut() {
      this.$store.commit(
        'setCreatingShortcut',
        !this.$store.state.isCreatingShortcut
      );
    },
  },

  mounted() {
    // Set the active tab to the store's active tab
    this.links.find(
      (link) => link.name === this.$store.getters.getActiveTab
    ).active = true;
  },
};
</script>

<style scoped>
#fixed-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: #1a1a1a;
  z-index: 10;
}

#title-bar-container {
  height: 110px;
  background-color: #0a0a0a;
  -webkit-app-region: drag;
  display: flex;
}

#title-bar-container > * {
  margin-top: auto;
  margin-bottom: auto;
}

#title-image {
  margin-left: 25px;
  margin-right: 15px;
  filter: brightness(1.8);
}

#title {
  color: #fff;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 1px;
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.2;
}

#nav-container {
  margin-right: auto;
  margin-left: auto;
}

#nav {
  list-style-type: none;
}

.nav-item {
  display: inline;
  margin-right: 15px;
}

.nav-btn {
  -webkit-app-region: no-drag;
  background-color: transparent;
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 2px;
  box-shadow: 0 0 0 2px transparent;
  transition: background-color 0.3s ease-out, box-shadow 0.3s ease-out;
  font-size: 16px;
  letter-spacing: 0px;
  font-weight: normal;
}

.nav-btn:hover {
  cursor: pointer;
  background-color: #1f1f1f;
}

.nav-btn:disabled {
  box-shadow: 0 0 0 2px #2b2b2b;
  background-color: #1f1f1f;
  cursor: default;
}

.titlebar-button {
  -webkit-app-region: no-drag;
  background-color: #1f1f1f;
  width: 35px;
  height: 35px;
  border: none;
  box-shadow: 0 0 0 2px #2b2b2b;
  border-radius: 3px;
  transition: background-color 0.5s ease-out;
  position: absolute;
}

#button-container {
  width: 150px;
}

#shortcut-btn {
  right: 85px;
  top: 35px;
}

#shortcut-btn:hover {
  background-color: #356fdc;
  cursor: pointer;
}

#close-btn {
  right: 35px;
  top: 35px;
}

#close-btn:hover {
  background-color: #dc3545;
  cursor: pointer;
}

.titlebar-button-icon {
  font-size: 17px;
}
</style>
