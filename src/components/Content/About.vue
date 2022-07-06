<template>
  <div id="about-container">
    <Card
      icon="fa-solid fa-circle-info"
      title="About Solar Tweaks"
      subtitle="Learn a bit more about Solar Tweaks, What is it and How it works"
      background="about"
      id="about-card"
      contentClass="vertical-card-container"
    >
      <div id="cards-item">
        <CardItem
          title="About Us"
          icon="fa-solid fa-user"
          id="about-us-card-item"
        >
          <p id="about-us">
            Solar Tweaks is a modification pack for Lunar Client. By modifying
            the game's code when it gets loaded, we add a variety of features
            that enhance your Minecraft experience. Browse and configure our
            "Modules" to your own needs under the Patcher tab, launch with one
            click, and enjoy a better Lunar Client!
            <br />
            We are not affiliated with Mojang or Moonsworth! We are just a bunch
            of people who love Lunar Client and want to make it better!
          </p>
        </CardItem>
        <div id="little-cards">
          <CardItem
            title="Solar Tweaks"
            icon="fa-solid fa-comments"
            subtitle="We are now using GitHub discussions to keep in touch with the community"
            class="little-card"
          >
            <button
              @click="openLink(constants.links.GH_DISCUSSIONS)"
              class="button"
            >
              <i class="fa-solid fa-up-right-from-square button-icon"></i>
              GitHub Discussions
            </button>
          </CardItem>
          <CardItem
            title="About Launcher"
            icon="fa-solid fa-code-branch"
            :subtitle="`Electron: v${aboutLauncherDescription.electron} • Node: v${aboutLauncherDescription.node} • Chrome: v${aboutLauncherDescription.chrome}`"
            class="little-card"
            ><h4 id="launcher-version">
              Version {{ aboutLauncherDescription.launcher }}
            </h4>
            <button @click="openSolarTweaksFolder()" class="button">
              <i class="fa-solid fa-folder-open button-icon"></i>
              Open ST folder
            </button>
          </CardItem>
          <CardItem
            title="Lunar Client"
            icon="fa-solid fa-moon"
            subtitle="Lunar Client official website, includes their store and official announcements"
            class="little-card"
          >
            <button
              @click="openLink(constants.links.LUNARCLIENT)"
              class="button"
            >
              <i class="fa-solid fa-up-right-from-square button-icon"></i>
              Lunar Client
            </button>
          </CardItem>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import { remote } from 'electron';
import process from 'process';

import Card from '../Card/Card.vue';
import CardItem from '../Card/CardItem.vue';
import constants from '../../constants';

export default {
  name: 'About',

  components: {
    Card,
    CardItem,
  },

  data: () => ({
    constants,
    aboutLauncherDescription: {
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      launcher: remote.app.getVersion(),
    },
  }),

  methods: {
    /**
     * Opens a link in the default browser
     * @param {string} url The url to open
     */
    openLink(url) {
      remote.shell.openExternal(url);
    },
    /**
     * Opens the Solar Tweaks folder
     */
    openSolarTweaksFolder() {
      remote.shell.openPath(constants.SOLARTWEAKS_DIR);
    },
  },
};
</script>

<style scoped>
#about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#about-card {
  margin-top: 50px;
}

#about-us {
  text-align: center;
  font-size: smaller;
  font-weight: 300;
  letter-spacing: 0.55px;
  line-height: 1.5;
}

.little-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#little-cards {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.button-icon {
  margin-right: 5px;
}

.button {
  background-color: #2b71ce;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  margin-top: 12px;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.button:hover {
  background-color: #2560ac;
}

#launcher-version {
  margin-top: 3px;
  font-weight: 400;
  text-align: center;
}
</style>
