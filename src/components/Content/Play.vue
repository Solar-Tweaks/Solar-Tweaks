<template>
  <div>
    <div
      id="play-container"
      :style="'height: ' + $store.getters.getPlayContainerHeight + 'px'"
    >
      <div id="buttons" :class="{ disabled: $store.state.isLaunching }">
        <button
          id="play-button"
          @click="launchGame()"
          :disabled="$store.state.isLaunching"
        >
          <span id="play-btn-title">{{
            $store.state.launchingState.title
          }}</span
          ><br />
          <i class="play-btn-icon" :class="$store.state.launchingState.icon"></i
          ><span id="play-btn-subtitle">{{
            $store.state.launchingState.message
          }}</span>
        </button>
        <button
          id="change-version-button"
          @click="isSelectingVersion = !isSelectingVersion"
          :disabled="$store.state.isLaunching"
        >
          <i class="fa-solid fa-angle-down play-btn-icon"></i>
        </button>
      </div>
      <div
        id="select-version-container"
        v-if="isSelectingVersion"
        @click="isSelectingVersion = !isSelectingVersion"
      >
        <h2 id="select-version-title">LAUNCH OPTIONS</h2>
        <h5 id="select-version-subtitle">
          SELECT A VERSION TO CHOOSE A NEW DEFAULT
        </h5>
        <div id="select-version-grid">
          <div
            class="select-version-card"
            v-for="availableVersion in availableVersions"
            v-bind:key="availableVersion.version"
            @click="selectVersion(availableVersion.version)"
          >
            <div
              class="select-version-card-inner-container"
              :style="`background: url('${availableVersion.background}')`"
            >
              <h3 class="select-version-card-title">
                Version {{ availableVersion.version }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import settings from 'electron-settings';
import { checkAndLaunch } from '../../javascript/minecraft';
import Logger from '../../javascript/logger';
import { updateActivity } from '../../javascript/discord';

const logger = new Logger('play');

export default {
  name: 'Play',

  data: () => ({
    isSelectingVersion: false,
    isLaunching: false,
    availableVersions: [
      {
        version: '1.18',
        background:
          'https://launcherimages.lunarclientcdn.com/versions/1_18.bb8fd4ac31.webp',
      },
      {
        version: '1.17',
        background:
          'https://launcherimages.lunarclientcdn.com/versions/1_17.1632241780.webp',
      },
      {
        version: '1.16',
        background:
          'https://launcherimages.lunarclientcdn.com/versions/1_16.47f82f804b.webp',
      },
      {
        version: '1.12',
        background:
          'https://launcherimages.lunarclientcdn.com/versions/1_12.4d900e6ec3.webp',
      },
      {
        version: '1.8.9',
        background:
          'https://launcherimages.lunarclientcdn.com/versions/1_8.1a68214027.webp',
      },
      {
        version: '1.7',
        background:
          'https://launcherimages.lunarclientcdn.com/versions/1_7.148c077787.webp',
      },
    ],
  }),

  methods: {
    /**
     * Launch the game
     */
    async launchGame() {
      await checkAndLaunch().catch((error) => {
        logger.error(error);
        updateActivity('In the launcher');
      });
    },

    /**
     * Set new version as default
     */
    async selectVersion(version) {
      await settings.set('version', version);
      await this.updateLaunchButton();
    },

    /**
     * Update the button title, message and icon
     */
    async updateLaunchButton() {
      const version = await settings.get('version');
      if (!version) return setTimeout(() => this.updateLaunchButton(), 150);
      this.$store.commit('setLaunchingState', {
        title: `LAUNCH ${version}`,
        message: 'READY TO LAUNCH',
        icon: 'fa-solid fa-gamepad',
      });
    },
  },

  async mounted() {
    // Timeout because when first launch there is no version set
    setTimeout(async () => await this.updateLaunchButton(), 150);
  },
};
</script>

<style scoped>
#play-container {
  width: 100%;
  height: 300px;
  margin-top: 110px;
  background: url('https://i.ibb.co/dkPrF69/background-images.png') no-repeat
    center center;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: height 0.5s ease-in-out;
}

#buttons {
  box-shadow: 0 0 25px -5px #28af55;
  transition: box-shadow 0.5s ease, transform 0.5s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}

#buttons:hover {
  box-shadow: 0 0 40px -5px #28af55;
  transform: scale(1.05);
}

#buttons.disabled {
  box-shadow: 0 0 25px -5px #8f28af;
}

#buttons.disabled:hover {
  box-shadow: 0 0 40px -5px #8f28af;
}

#play-button {
  box-shadow: 0 0 25px -5px #28af55;
  background-color: #28af55d9;
  border: none;
  width: 315px;
  height: 70px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

#play-button:hover {
  background-color: #2cbe5dd1;
}

#play-button:disabled {
  background-color: #8f28afd9;
  cursor: default;
  width: 355px;
  border-radius: 10px;
}

#change-version-button {
  box-shadow: 0 0 25px -5px #28af55;
  background-color: #28af55d9;
  border: none;
  width: 40px;
  height: 70px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

#change-version-button:hover {
  background-color: #2cbe5dd1;
}

#change-version-button:disabled {
  display: none;
}

#play-btn-title {
  font-size: x-large;
  font-weight: 700;
  letter-spacing: 2.5px;
  line-height: 1.2;
  text-shadow: 0px 1.4px 1px rgba(0, 0, 0, 0.775);
}

.play-btn-icon {
  margin-right: 8px;
}

#play-btn-subtitle {
  font-size: 0.775rem;
  font-weight: 400;
  letter-spacing: 3px;
  line-height: 1.2;
  text-shadow: 0px 1.4px 1px rgba(0, 0, 0, 0.775);
}

#select-version-container {
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

#select-version-title {
  letter-spacing: 2px;
  font-weight: 600;
  font-size: 35px;
  margin-top: 5%;
}

#select-version-subtitle {
  letter-spacing: 2px;
  font-weight: 300;
  margin-top: 5px;
}

#select-version-grid {
  display: grid;
  grid-template-columns: repeat(3, 400px);
  grid-template-rows: repeat(2, 150px);
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  justify-content: center;
  margin-top: 15px;
}

.select-version-card {
  border-radius: 15px;
  cursor: pointer;
  overflow: hidden;
}

.select-version-card-inner-container {
  width: 100%;
  height: 100%;
  transform: scale(1.05);
  transition: transform 0.4s ease-out;
}

.select-version-card-inner-container:hover {
  transform: scale(1.1);
}

.select-version-card-title {
  font-size: 35px;
  padding-top: 55px; /* Value found with something called bruteforce and my eyes with Dummy */
}
</style>
