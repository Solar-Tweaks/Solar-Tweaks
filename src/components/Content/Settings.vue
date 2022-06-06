<template>
  <div id="settings-container">
    <Card
      icon="fa-solid fa-gears"
      title="GAME & LAUNCHER SETTINGS"
      subtitle="CUSTOMIZE LAUNCHER BEHAVIOR"
      background="settings-1"
      class="settings-card"
      contentClass="horizontal-card-container"
    >
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-regular fa-folder-open"
          title="Launch Directories"
          subtitle="Select which directory to launch Minecraft from"
          class="directories-card-item"
          contentClass="directories-card-item-content"
        >
          <div id="settings-directories">
            <div
              class="settings-directories-item"
              v-for="directory in directories"
              v-bind:key="directory.version"
            >
              <span class="settings-directories-item-version">{{
                directory.version.length === 3
                  ? '⠀' + directory.version
                  : directory.version
              }}</span>
              <input
                type="text"
                class="input settings-directories-input"
                v-model="directory.path"
                @click="setNewDirectory(directory.version)"
              />
            </div>
            <button
              id="directory-reset-button"
              class="button"
              @click="resetLaunchDirectories()"
            >
              <i class="fa-solid fa-arrow-rotate-right button-icon"></i>
              <span class="button-text">Reset to default</span>
            </button>
          </div>
        </CardItem>
      </div>
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-solid fa-sliders"
          title="Allocated Memory"
          subtitle="Memory allocated towards the game"
          class="settings-card-little"
        >
          <div id="settings-ram">
            <input
              type="range"
              :min="ram.minimum"
              :max="ram.maximum"
              v-model="ram.current"
              step="250"
              class="slider"
              id="settings-ram-slider"
              @change="updateRam()"
            />
            <div id="settings-ram-values-container">
              <span id="settings-ram-value"
                >{{ ram.current }} MB ALLOCATED</span
              >
              <br />
              <span id="settings-ram-indicator"
                >YOU HAVE {{ Math.round(ram.maximum - ram.current) }} MB LEFT TO
                ALLOCATE</span
              >
            </div>
          </div>
        </CardItem>
        <CardItem
          icon="fa-solid fa-compress"
          title="Resolution"
          subtitle="Enter a resolution to launch your game in"
          class="settings-card-little"
        >
          <div id="settings-resolution">
            <div id="settings-resolution-left">
              <div class="settings-resolution-title">
                <i class="fa-solid fa-text-width settings-resolution-icon"></i>
                <span>Width</span>
              </div>
              <input
                type="number"
                class="settings-resolution-input"
                placeholder="854"
                v-model="resolution.width"
                @change="updateResolution()"
              />
            </div>
            <div id="settings-resolution-middle"><br /><br />X</div>
            <div id="settings-resolution-right">
              <div class="settings-resolution-title">
                <i class="fa-solid fa-text-height settings-resolution-icon"></i>
                <span>Height</span>
              </div>
              <input
                type="number"
                class="settings-resolution-input"
                placeholder="480"
                v-model="resolution.height"
                @change="updateResolution()"
              />
            </div>
          </div>
        </CardItem>
      </div>
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-solid fa-angles-left"
          title="Before Launch"
          subtitle="Select what to do before launching Minecraft"
          class="settings-card-little"
        >
          <div id="settings-before-launch-container">
            <div class="settings-before-launch">
              <input
                type="checkbox"
                id="settings-skip-checks-input"
                v-model="skipChecks"
                @change="updateSkipChecks()"
              /><span id="settings-debug-mode-text"
                >Skip checks (game files, JRE, licenses, natives and assets)
                <span class="settings-debug-mode-warning"
                  ><i
                    class="settings-debug-mode-warning fa-solid fa-triangle-exclamation"
                  ></i
                  > Warning: Not recommended for Normal Users unless told by a Developer!</span
                ></span
              >
            </div>
          </div>
        </CardItem>
        <CardItem
          icon="fa-solid fa-circle-play"
          title="After Launch"
          subtitle="Select which action your launcher should take on launch"
          class="settings-card-little"
        >
          <div id="settings-after-launch">
            <button
              class="button settings-after-launch-action"
              v-for="action in actions"
              v-bind:key="action.id"
              v-bind:class="{
                'settings-after-launch-action-active':
                  actionAfterLaunch === action.id,
              }"
              @click="updateActionAfterLaunch(action.id)"
            >
              {{ action.name }}
            </button>
          </div>
        </CardItem>
      </div>
    </Card>

    <Card
      icon="fa-brands fa-java"
      title="JAVA SETTINGS"
      subtitle="JAVA & JRE PREFERENCES"
      background="settings-2"
      class="settings-card"
      contentClass="horizontal-card-container"
    >
      <CardItem
        icon="fa-brands fa-java"
        title="JVM Arguments"
        subtitle="Put your JVM arguments here (if you don't really know what this is, don't touch it or use a preset)"
        class="settings-card-item"
      >
        <div id="settings-args">
          <textarea
            spellcheck="false"
            id="settings-args-input"
            v-model="jvmArguments"
            @change="updateJvmArguments()"
          ></textarea>
          <button
            class="button"
            id="settings-args-button"
            @click="jvmArgumentsPresetsVisible = !jvmArgumentsPresetsVisible"
          >
            <i class="fa-solid fa-circle-chevron-down button-icon"></i>
            <span class="button-text">Presets</span>
          </button>
          <div id="args-presets" v-if="jvmArgumentsPresetsVisible">
            <div id="args-presets-title-container">
              <i class="fa-brands fa-java" id="args-presets-icon"></i>
              <h3 id="args-presets-title">Arguments presets</h3>
            </div>
            <p id="args-presets-subtitle">
              Select a preset from the list below, these presets are safe if
              used with the correct JRE
            </p>
            <div id="args-presets-preset-container">
              <button
                v-for="jvmArgumentsPreset in jvmArgumentsPresets"
                v-bind:key="jvmArgumentsPreset"
                class="args-presets-preset-button"
                @click="updateJvmArguments(jvmArgumentsPreset.args)"
              >
                {{ jvmArgumentsPreset.name }}
              </button>
            </div>
          </div>
        </div>
      </CardItem>
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-solid fa-desktop"
          title="Java Executable"
          subtitle="Set a custom JRE and whether or not to show the console when running the game"
          class="settings-card-little"
          id="jre-settings"
        >
          <div id="settings-jre-path">
            <input
              type="text"
              v-model="jrePath"
              class="input"
              id="settings-jre-path-input"
              @click="setJrePath()"
            />
            <button
              class="button"
              id="settings-jre-path-button"
              @click="resetJrePath()"
            >
              <i class="fa-solid fa-arrow-rotate-right button-icon"></i>
              <span class="button-text">Reset</span>
            </button>
          </div>
          <div id="settings-debug-mode">
            <input
              type="checkbox"
              id="settings-debug-mode-input"
              v-model="debugMode"
              @change="updateDebugMode()"
            /><span id="settings-debug-mode-text">Launch in debug mode</span>
          </div>
        </CardItem>
      </div>
      <CardItem
        icon="fa-solid fa-file-zipper"
        title="JRE Downloader"
        subtitle="⚠️ This feature is only available on Windows"
        class="settings-card-item"
      >
        <div id="settings-jre-downloader">
          <div
            v-for="jre in availableJres"
            v-bind:key="jre.name"
            class="jre-item"
          >
            {{ jre.name }}
            <button
              class="jre-item-button"
              @click="downloadJre(jre)"
              v-if="!downloadedJres.includes(jre.name)"
              :disabled="
                downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i
                class="fa-solid fa-spinner jre-item-icon jre-item-icon-spinner"
                v-if="downloadingJre === jre.name"
              ></i>
              <i
                class="fa-solid fa-download jre-item-icon"
                v-if="downloadingJre !== jre.name"
              ></i>
              <span v-if="downloadingJre !== jre.name">Download</span>
            </button>
            <button
              class="jre-item-button"
              @click="applyJre(jre.name)"
              v-if="downloadedJres.includes(jre.name)"
              :disabled="
                !downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i class="fa-solid fa-screwdriver-wrench jre-item-icon"></i>Apply
            </button>
            <button
              class="jre-item-button jre-item-button-red"
              @click="removeJre(jre.name)"
              v-if="downloadedJres.includes(jre.name)"
              :disabled="
                !downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i class="fa-solid fa-trash-can jre-item-icon"></i>Remove
            </button>
          </div>
        </div>
      </CardItem>
    </Card>
  </div>
</template>

<script>
import Card from '../Card/Card.vue';
import CardItem from '../Card/CardItem.vue';

import { remote } from 'electron';
import settings from 'electron-settings';
import { totalmem, platform } from 'os';
import { join } from 'path';
import { defaultSettings } from '../../javascript/settings';
import axios from 'axios';
import { cache } from '../../main';
import {
  downloadJre as _downloadJre,
  removeJre as _removeJre,
} from '../../javascript/jreDownloader';
import Logger from '../../javascript/logger';
import constants from '../../constants';
const logger = new Logger('settings');

export default {
  name: 'Settings',

  components: {
    Card,
    CardItem,
  },

  data: () => ({
    directories: [],
    ram: {
      minimum: 250,
      maximum: (totalmem() / 1024 / 1024) * 0.9,
      current: 4000,
    },
    resolution: {
      width: 854,
      height: 480,
    },
    actions: [
      { name: 'Close Launcher', id: 'close' },
      { name: 'Hide Launcher', id: 'hide' },
      { name: 'Keep Launcher Open', id: 'keep' },
    ],
    actionAfterLaunch: 'close',
    jvmArguments: '',
    jvmArgumentsPresetsVisible: false,
    jvmArgumentsPresets: [
      {
        name: 'Default',
        args: '-Xms1G -Xmx1G -Xmn768m -XX:+DisableAttachMechanism',
      },
      {
        name: 'Zulu optimized',
        args: '-Xverify:none -Xss2M -Xmn1G -XX:+UnlockExperimentalVMOptions -XX:+AlwaysActAsServerClassMachine -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32 -XX:G1HeapRegionSize=8M -XX:GCTimeLimit=50 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:-UsePerfData -XX:+PerfDisableSharedMem -XX:+UseLargePages -XX:+AlwaysPreTouch -XX:+EliminateLocks -XX:+AggressiveHeap -XX:+EagerJVMCI',
      },
      {
        name: 'GraalVM Community',
        args: '-Xms3G -Xmx3G -Xmn1G -XX:+DisableAttachMechanism -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M -XX:+EnableJVMCI -XX:+UseJVMCICompiler -XX:+EagerJVMCI -Djvmci.Compiler=graal',
      },
      {
        name: 'GraalVM Enterprise',
        args: '-Xverify:none -Xss2M -Xmn1G -XX:+UnlockExperimentalVMOptions -XX:+AlwaysActAsServerClassMachine -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32 -XX:G1HeapRegionSize=8M -XX:GCTimeLimit=50 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:-UsePerfData -XX:+PerfDisableSharedMem -XX:+UseLargePages -XX:+AlwaysPreTouch -XX:JVMCIThreads=2 -XX:+EliminateLocks -XX:+AggressiveHeap -Dgraal.TuneInlinerExploration=1 -XX:+EagerJVMCI',
      },
    ],
    jrePath: '',
    debugMode: false,
    skipChecks: false,
    // Enabled by default because a lot of people are on Windows
    jreDownloaderEnabled: true,
    availableJres: {
      Temurin: {
        32: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.1%2B12/OpenJDK17U-jre_x86-32_windows_hotspot_17.0.1_12.zip',
          checksum:
            'f4bb1323cb34cdb42b92d825fe36fddd78b274f071b8971c5207a66a0e82748a',
          folder: 'jdk-17.0.1+12-jre',
        },
        64: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.2%2B8/OpenJDK17U-jre_x64_windows_hotspot_17.0.2_8.zip',
          checksum:
            'c3204a19aede95ed02ad0f427210855a951d845ab7f806fb56b774daf2572454',
          folder: 'jdk-17.0.2+8-jre',
        },
        name: 'Temurin',
      },
      Zulu: {
        32: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.32.13-ca-jre17.0.2-win_i686.zip',
          checksum:
            'cb86ffb1232dfa77d6a538b4438877721180388716b7cf7403afd04dd9934ce1',
          folder: 'zulu17.32.13-ca-jre17.0.2-win_i686',
        },
        64: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.32.13-ca-jre17.0.2-win_x64.zip',
          checksum:
            'a8f31891c563890c65ac20ff52906f16891a62d7bb497e389964153205cfd588',
          folder: 'zulu17.32.13-ca-jre17.0.2-win_x64',
        },
        name: 'Zulu',
      },
    },
    downloadedJres: [],
    downloadingJre: '',
  }),

  methods: {
    /**
     * Set the new directory for a given version
     * @param {string} version The version to set the directory for
     */
    async setNewDirectory(version) {
      const directoryIndex = this.directories.findIndex(
        (directory) => directory.version === version
      );
      const folder = await remote.dialog.showOpenDialog({
        title: `Select the new directory for Lunar Client ${version}`,
        defaultPath: this.directories[directoryIndex].path,
        properties: ['dontAddToRecent', 'openDirectory'],
      });

      if (folder.canceled) return;

      this.directories[directoryIndex].path = folder.filePaths[0];

      await settings.set('launchDirectories', this.directories);
    },

    /**
     * Reset the launch directories to their default values
     */
    async resetLaunchDirectories() {
      this.directories = defaultSettings.launchDirectories;
      await settings.set('launchDirectories', this.directories);
    },

    /**
     * Update the allocated memory for the game
     */
    async updateRam() {
      await settings.set('ram', this.ram.current);
    },

    /**
     * Update the resolution for the game
     */
    async updateResolution() {
      if (!this.resolution.width) this.resolution.width = 854;
      if (!this.resolution.height) this.resolution.height = 480;
      await settings.set('resolution', this.resolution);
    },

    /**
     * Update the action to take after launch
     * @param {'close'|'hide'|'keep'} action The action to take after launch
     */
    async updateActionAfterLaunch(action) {
      this.actionAfterLaunch = action;
      await settings.set('actionAfterLaunch', action);
    },

    /**
     * Update JVM arguments
     */
    async updateJvmArguments(newArguments = undefined) {
      if (newArguments) {
        this.jvmArgumentsPresetsVisible = false;
        this.jvmArguments = newArguments;
      }
      await settings.set('jvmArguments', this.jvmArguments);
    },

    /**
     * Set new JRE path
     */
    async setJrePath() {
      const folder = await remote.dialog.showOpenDialog({
        title: `Select the new JRE for Lunar Client (Select the bin folder)`,
        defaultPath: this.jrePath,
        properties: ['dontAddToRecent', 'openDirectory'],
      });

      if (folder.canceled) return;

      this.jrePath = folder.filePaths[0];

      await settings.set('jrePath', this.jrePath);
    },

    /**
     * Reset JRE path
     */
    async resetJrePath() {
      this.jrePath = defaultSettings.jrePath;
      await settings.set('jrePath', defaultSettings.jrePath);
    },

    /**
     * Update the debug mode
     */
    async updateDebugMode() {
      await settings.set('debugMode', this.debugMode);
    },

    /**
     * Update the skip checks
     */
    async updateSkipChecks() {
      await settings.set('skipChecks', this.skipChecks);
    },

    /**
     * Update downloaded JREs
     */
    async updateDownloadedJres() {
      await settings.set('downloadedJres', this.downloadedJres);
    },

    /**
     * Apply a JRE
     */
    async applyJre(jrePath) {
      this.jrePath = join(
        constants.DOTLUNARCLIENT,
        'solartweaks',
        'jres',
        jrePath,
        'bin'
      );
      await settings.set('jrePath', this.jrePath);
    },

    /**
     * Call the JRE downloader
     * @param {any} jre JRE Object
     */
    async downloadJre(jre) {
      this.jreDownloaderEnabled = false;
      this.downloadingJre = jre.name;
      const success = await _downloadJre(jre);

      if (success) {
        this.downloadedJres.push(jre.name);
        this.updateDownloadedJres();
      }

      this.downloadingJre = '';
      this.jreDownloaderEnabled = true;
    },

    /**
     * Call the JRE Downloader to remove a JRE
     */
    async removeJre(jre) {
      this.downloadedJres = this.downloadedJres.filter((name) => name !== jre);
      await this.updateDownloadedJres();
      await _removeJre(jre);
    },
  },

  async beforeMount() {
    this.directories = await settings.get('launchDirectories');
    this.ram.current = await settings.get('ram');
    this.resolution = await settings.get('resolution');
    this.actionAfterLaunch = await settings.get('actionAfterLaunch');
    this.jvmArguments = await settings.get('jvmArguments');
    this.jrePath = await settings.get('jrePath');
    this.debugMode = await settings.get('debugMode');
    this.skipChecks = await settings.get('skipChecks');
    this.downloadedJres = await settings.get('downloadedJres');

    if (platform() !== 'win32') this.jreDownloaderEnabled = false;

    if (cache.has('availableJres'))
      return (this.availableJres = cache.get('availableJres'));

    await axios
      .get(`${constants.API_URL}/launcher/jreDownloader`)
      .then((response) => {
        cache.set('availableJres', response.data);
        this.availableJres = response.data;
      })
      .catch(() => {
        cache.set('availableJres', this.availableJres);
        logger.warn(
          'Failed to fetch available JREs, falling back to hardcoded data...'
        );
      });
  },
};
</script>

<style scoped>
/* Pseudo components */

.input {
  height: 10px;
  background-color: #171717;
  border: none;
  outline: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 5px;
}

.button {
  background-color: #2b71ce;
  border: none;
  height: 30px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.button:hover {
  background-color: #2560ac;
}

.button-icon {
  margin-left: 20px;
  margin-right: 10px;
}

.button-text {
  margin-right: 20px;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: #d3d3d3;
  opacity: 1;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
}

/* Content */

#settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 75px;
}

.settings-card {
  margin-top: 10px;
}

.settings-card-item {
  margin: 10px;
  flex: 1 1 0px;
}

.settings-card-item.settings-card-item-container {
  display: flex;
  flex-direction: column;
}

#settings-directories {
  margin-top: 20px;
  display: flex;
  flex: 1 1 0px;
  flex-direction: column;
  justify-content: space-between;
}

.settings-directories-item {
  display: flex;
  align-items: center;
  margin: 3px;
}

.settings-directories-item-version {
  font-weight: 200;
  font-size: 15px;
  margin-right: 10px;
}

.settings-directories-input {
  flex: 1 1 0px;
}

#directory-reset-button {
  margin-top: 15px;
}

.directories-card-item {
  display: flex;
  flex-direction: column;
}

.directories-card-item-content {
  flex: 1 1 0px;
  display: flex;
}

#settings-ram {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#settings-ram-slider {
  margin-top: 5px;
  margin-bottom: 20px;
}

#settings-ram-values-container {
  text-align: center;
}

#settings-ram-indicator {
  font-size: 10px;
  margin-top: 5px;
  letter-spacing: 1px;
}

.settings-resolution-title {
  display: flex;
}

.settings-resolution-icon {
  font-size: 20px;
  margin-right: 7px;
}

.settings-resolution-input {
  border: #343434 1px solid;
  border-radius: 4px;
  background: transparent;
  outline: none;
  width: 75px;
  height: 30px;
  margin-top: 12px;
  text-align: center;
  font-style: italic;
  font-size: 16px;
  font-weight: bold;
}

.settings-resolution-input::-webkit-outer-spin-button,
.settings-resolution-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

#settings-resolution {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  height: 69px;
}

#settings-resolution-left {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}

#settings-resolution-right {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.settings-before-launch-container {
  display: flex;
  flex-direction: row;
}

.settings-before-launch {
  margin-top: 7px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

#settings-after-launch {
  width: 100%;
}

.settings-after-launch-action {
  width: 100%;
  background-color: #343434;
  margin-top: 10px;
}

.settings-after-launch-action:hover {
  background-color: #2b2b2b;
}

.settings-after-launch-action-active {
  background-color: #2b71ce;
}

.settings-after-launch-action-active:hover {
  background-color: #2560ac;
}

#settings-args {
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

#args-presets {
  position: absolute;
  width: 490px;
  height: 190px;
  margin-left: 377px;
  margin-top: 16px;
  background-color: #1d1d1b;
  border: #343434 1px solid;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

#args-presets-title-container {
  display: flex;
}

#args-presets-icon {
  font-size: 26px;
  margin-top: 8px;
  margin-left: 15px;
}

#args-presets-title {
  font-size: 20px;
  margin-left: 10px;
  font-weight: 500;
  margin-top: 9px;
}

#args-presets-subtitle {
  font-weight: 400;
  font-size: 12px;
  margin-left: 15px;
  margin-top: 6px;
  padding-bottom: 5px;
}

#args-presets-preset-container {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(5, 25px);
  grid-column-gap: 5px;
  grid-row-gap: 3px;
}

.args-presets-preset-button {
  border-radius: 6px;
  width: 150px;
  height: 25px;
  outline: none;
  border: none;
  background-color: #252523;
  margin-top: 2px;
  margin-left: 15px;
  transition: background-color 0.2s ease;
}

.args-presets-preset-button:hover {
  background-color: #2b2b2b;
}

#settings-args-input {
  resize: none;
  border: none;
  outline: none;
  background-color: #171717;
  font-style: italic;
  margin: 15px;
  margin-bottom: 0px;
  width: 95%;
  height: 75%;
  padding: 5px;
  border-radius: 5px;
}

#settings-args-button {
  margin-top: 10px;
}

#settings-jre-path {
  display: flex;
  margin-top: 5px;
}

#settings-jre-path-input {
  flex: 1 1 0px;
  height: 20px;
  margin-right: 7px;
}

#settings-debug-mode {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

#settings-debug-mode-input {
  margin-top: 10px;
}

#settings-debug-mode-text {
  margin-left: 10px;
  margin-top: 7px;
}

.settings-debug-mode-warning {
  color: #d0342c;
}

#settings-jre-downloader {
  margin-top: 20px;
  height: 234px;
}

#jre-settings {
  margin: 0;
}

.jre-item {
  margin: 10px;
}

.jre-item-button {
  margin-left: 5px;
  border: none;
  background-color: #2b71ce;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.jre-item-button.jre-item-button-red {
  background-color: #dd3e3e;
}

.jre-item-button.jre-item-button-red:hover {
  background-color: #c12c2c;
}

.jre-item-button:hover {
  background-color: #2560ac;
}

.jre-item-button:disabled {
  background-color: #343434;
  cursor: not-allowed;
}

.jre-item-icon {
  margin-right: 5px;
}

.jre-item-icon-spinner {
  animation-name: spin;
  animation-duration: 2000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
