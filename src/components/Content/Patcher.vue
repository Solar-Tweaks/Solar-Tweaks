<template>
  <div
    id="options-background-filter"
    @click="toggleCustomizationOptions(null)"
    v-if="customizing.open"
  ></div>
  <div id="options-container" v-if="customizing.open">
    <div id="options-title-container">
      <img
        :src="require('../../assets/icons/' + customizing.customization.icon)"
        id="options-icon"
        :alt="`${customizing.customization.name} Image`"
      />
      <h1 id="options-title">{{ customizing.customization.name }}</h1>
    </div>
    <div id="options-content">
      <h3 id="options-label">Enter custom values:</h3>
      <div
        v-for="(value, name) in customizing.customization.values"
        v-bind:key="name"
        class="options-value-container"
      >
        <h4 class="options-value-title">
          {{ convertToDisplayableString(name) }}:
        </h4>
        <input
          v-model="customizing.customization.values[name]"
          type="text"
          class="options-input"
          spellcheck="false"
          @change="updateCustomization()"
        />
      </div>
    </div>
  </div>
  <div id="customize-container">
    <div
      class="customization-container"
      v-for="customization in customizations"
      v-bind:key="customization.name"
    >
      <div class="customization-icon-container">
        <img
          :src="require('../../assets/icons/' + customization.icon)"
          class="customization-icon"
          :alt="`${customization.name} Image`"
        />
      </div>
      <h3 class="customization-name">{{ customization.name }}</h3>
      <button
        class="customization-options-btn"
        v-if="customization.hasOwnProperty('values')"
        @click="toggleCustomizationOptions(customization)"
      >
        OPTIONS
      </button>
      <button
        class="customization-toggle-btn"
        @click="toggleCustomization(customization)"
        v-bind:class="{
          'customization-toggle-btn-disabled': !customization.enabled,
          'customization-toggle-btn-enabled': customization.enabled,
        }"
      >
        {{ customization.enabled ? 'ENABLED' : 'DISABLED' }}
      </button>
    </div>
  </div>
</template>

<script>
import settings from 'electron-settings';
import { updateActivity } from '../../javascript/discord';
import Logger from '../../javascript/logger';
const logger = new Logger('customize');

export default {
  name: 'Patcher',

  data: () => ({
    customizations: [
      {
        name: 'Freelook & AutoTextHotKey',
        icon: 'freelook.png',
        internal: 'metadata',
        call: 'modSettings',
        enabled: false,
      },
      {
        name: 'Remove Pinned Servers',
        icon: 'pinned_servers.png',
        internal: 'metadata',
        call: 'pinnedServers',
        enabled: false,
      },
      {
        name: 'Remove Blog Posts',
        icon: 'blogpost.png',
        internal: 'metadata',
        call: 'blogPosts',
        enabled: false,
      },
      {
        name: 'Cloaks+',
        icon: 'cloaks.png',
        internal: 'cloaksPlus',
        enabled: true,
      },
      {
        name: 'Remove Mods Packet',
        icon: 'cog.png',
        internal: 'modpacketRemoval',
        enabled: false,
      },
      {
        name: 'Nick Hider',
        icon: 'nick_hider.png',
        internal: 'nickhider',
        values: {
          to: 'You',
        },
        enabled: false,
      },
      {
        name: 'Lunar Overlays',
        icon: 'themes.png',
        internal: 'supportOverlays',
        enabled: true,
      },
      {
        name: 'Reach Text',
        icon: 'hit_delay.png',
        internal: 'reachText',
        values: {
          to: 'blocks',
        },
        enabled: false,
      },
      {
        name: 'Uncap Reach Display',
        icon: 'hit_delay.png',
        internal: 'uncapReach',
        enabled: false,
      },
      {
        name: 'Discord RPC',
        icon: 'discord.png',
        internal: 'rpcUpdate',
        values: {
          clientID: '920998351430901790',
          icon: 'logo',
          iconText: 'Solar Tweaks',
          afkText: 'AFK',
          menuText: 'In Menu',
          singlePlayerText: 'Playing Singleplayer',
        },
        enabled: true,
      },
      {
        name: 'Remove Fake Level Head',
        icon: 'hypixel.png',
        internal: 'removeFakeLevelhead',
        enabled: false,
      },
      {
        name: 'Fix Ping Sound',
        icon: 'pings.png',
        internal: 'fixPings',
        enabled: false,
      },
      {
        name: 'Remove Hit Delay',
        icon: 'hit_delay.png',
        internal: 'noHitDelay',
        enabled: false,
      },
      {
        name: 'Window Title',
        icon: 'window.png',
        internal: 'windowName',
        values: {
          to: 'Lunar Client (Modded by Solar Tweaks)',
        },
        enabled: true,
      },
      {
        name: 'Privacy',
        icon: 'privacy.png',
        internal: 'websocketPrivacy',
        privacyModules: ['tasklistPrivacy', 'hostslistPrivacy'],
        enabled: false,
      },
      {
        name: 'Level Head',
        icon: 'hypixel.png',
        internal: 'levelHead',
        values: {
          to: 'Level',
        },
        enabled: false,
      },
      {
        name: 'Toggle Sprint Texts',
        icon: 'toggle_sprint.png',
        internal: 'toggleSprintText',
        values: {
          flying: 'flying',
          riding: 'riding',
          descending: 'descending',
          dismounting: 'dismounting',
          sneaking: 'sneaking',
          sprinting: 'sprinting',
        },
        special: 'toggleSprintText',
        enabled: false,
      },
      {
        name: 'FPS Spoof',
        icon: 'fps.png',
        internal: 'fpsSpoof',
        values: {
          multiplier: 2.0,
        },
        enabled: false,
      },
      {
        name: 'FPS',
        icon: 'fps.png',
        internal: 'fps',
        values: {
          to: 'FPS',
        },
        enabled: false,
      },
      {
        name: 'CPS',
        icon: 'cps.png',
        internal: 'cps',
        values: {
          to: 'CPS',
        },
        enabled: false,
      },
      {
        name: 'Auto GG',
        icon: 'hypixel.png',
        internal: 'autoGG',
        values: {
          to: '/achat gg',
        },
        enabled: false,
      },
      {
        name: 'Remove hashing',
        icon: 'hash.png',
        internal: 'removeHashing',
        enabled: false,
      },
      {
        name: 'Options in Singleplayer',
        icon: 'cog.png',
        internal: 'lunarOptions',
        enabled: false,
      },
      {
        name: 'Toggle Sneak in Container',
        icon: 'toggle_sprint.png',
        internal: 'toggleSneakContainer',
        enabled: false,
      },
      {
        name: 'Change ping text',
        icon: 'ping.png',
        internal: 'pingText',
        values: {
          to: 'ms',
        },
        enabled: false,
      },
      {
        name: 'Change ping value',
        icon: 'ping.png',
        internal: 'pingSpoof',
        values: {
          pingValue: '100',
        },
        enabled: false,
      },
      {
        name: 'Always render cloth cloaks',
        icon: 'cloak.png',
        internal: 'clothCapes',
        enabled: false,
      },
      {
        name: 'Adjust hurt cam',
        icon: 'toggle_sprint.png',
        internal: 'hurtCamShake',
        values: {
          multiplier: 0.3,
        },
        enabled: false,
      },
      {
        name: 'Remove chat limit',
        icon: 'chat.png',
        internal: 'chatLimit',
        values: {
          limit: 255,
        },
        enabled: false,
      },
      {
        name: 'Remove Lunar chat cooldown',
        icon: 'chat.png',
        internal: 'removeChatDelay',
        enabled: true,
      },
      {
        name: 'Mumble fix',
        icon: 'mumble.png',
        internal: 'mumbleFix',
        enabled: false,
      },
      {
        name: 'Websocket',
        icon: 'websocket.png',
        internal: 'websocket',
        values: {
          to: 'wss://assetserver.lunarclientprod.com/connect',
        },
        enabled: false,
      },
      {
        name: 'Show wrapped',
        icon: 'wrapped.png',
        internal: 'enableWrapped',
        enabled: false,
      },
    ],
    customizing: {
      open: false,
      customization: {
        values: {},
      },
    },
  }),

  methods: {
    /**
     * Make letter of each word uppercase and replace underscores with spaces
     * Credits to GitHub copilot for this one
     * @param {string} str String to convert
     */
    convertToDisplayableString(str) {
      if (str === 'to') return 'Text';
      return str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    /**
     * Toggle a customization
     * @param {Object} customization The customization to toggle
     */
    async toggleCustomization(customization) {
      customization.enabled = !customization.enabled;
      logger.debug(
        `${customization.name} is now ${
          customization.enabled ? 'enabled' : 'disabled'
        }`
      );
      await this.writeCustomizations();
    },

    /**
     * Toggle the customization options popup
     */
    toggleCustomizationOptions(customization) {
      this.customizing.open = !this.customizing.open;
      this.customizing.customization = customization;
    },

    /**
     * Update customization value
     */
    async updateCustomization() {
      this.customizations.find(
        (customizations) =>
          customizations.name === this.customizing.customization.name
      ).value = this.customizing.customization.value;
      await this.writeCustomizations();
    },

    /**
     * Write customizations to settings
     */
    async writeCustomizations() {
      const customizations = [];
      this.customizations.forEach((customization) => {
        customizations.push({
          name: customization.name,
          internal: customization.internal,
          values: customization.values,
          privacyModules: customization.privacyModules,
          call: customization.call,
          enabled: customization.enabled,
        });
      });
      await settings.set('customizations', customizations);
    },
  },

  async beforeMount() {
    // Loads enabled customizations from settings
    const customizations = await settings.get('customizations');
    logger.info('Loading customizations from settings');
    if (customizations) {
      customizations.forEach((savedCustomization) => {
        // Privacy module
        if (
          Object.prototype.hasOwnProperty.call(
            savedCustomization,
            'privacyModules'
          )
        ) {
          const privacyModule = this.customizations.find((c) =>
            Object.prototype.hasOwnProperty.call(c, 'privacyModules')
          );
          if (privacyModule) privacyModule.enabled = savedCustomization.enabled;
          return;
        }
        this.customizations.forEach((customization) => {
          if (customization.name === savedCustomization.name) {
            customization.enabled = savedCustomization.enabled;
            if (Object.keys(customization).includes('values'))
              for (const key in customization.values)
                customization.values[key] = savedCustomization.values[key];
          }
        });
      });
    }
    updateActivity('In the launcher', 'Customizing the game');
  },

  unmounted() {
    if (!this.$store.getters.isLaunching) {
      updateActivity('In the launcher');
    }
  },
};
</script>

<style scoped>
#options-background-filter {
  position: fixed;
  background-color: #00000070;
  height: 80%;
  width: 100%;
  top: 110px;
  z-index: 100;
}

#options-container {
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
}

#options-title-container {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

#options-icon {
  height: 55px;
  width: 55px;
  margin-right: 20px;
}

#options-title {
  letter-spacing: 2px;
  font-weight: 600;
  margin-top: 8px;
}

#options-content {
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  align-items: center;
}

#options-label {
  font-weight: 500;
  font-size: 25px;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.options-value-container {
  display: flex;
}

.options-value-title {
  text-align: center;
  font-weight: 500;
  font-size: 24px;
  margin-top: 35px;
  margin-right: 15px;
}

.options-input {
  border: none;
  background-color: #202020;
  outline: none;
  height: 50px;
  width: 450px;
  margin-top: 15px;
  font-size: 25px;
  padding: 15px;
  text-align: center;
  border-radius: 15px;
}

#customize-container {
  display: grid;
  grid-template-columns: repeat(4, 250px);
  grid-template-rows: repeat(2, 250px);
  grid-column-gap: 35px;
  grid-row-gap: 30px;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 75px;
}

.customization-container {
  background-color: #232324;
  width: 250px;
  height: 250px;
  border-radius: 20px;
  border: 3px solid #30323456;
  transition: background-color 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.customization-container:hover {
  background-color: rgba(77, 80, 83, 0.337);
}

.customization-icon-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: auto;
  margin-top: 25px;
}

.customization-icon {
  -webkit-user-drag: none;
  width: 70px;
  height: 70px;
  margin-left: auto;
  margin-right: auto;
}

.customization-name {
  color: #a4a9ad70;
  text-align: center;
  font-weight: 350;
  margin-top: 25px;
  color: #f7f7f783;
  font-size: 20px;
}

.customization-toggle-btn {
  width: 100%;
  height: 50px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  font-size: 15px;
  letter-spacing: 5px;
  font-weight: 500;
  position: absolute;
  bottom: 0;
  cursor: pointer;
}

.customization-toggle-btn-disabled {
  background-color: #a22143;
  border: 2px solid #b5506b;
  transition: background-color 0.3s, border 0.3s;
}

.customization-toggle-btn-disabled:hover {
  background-color: #de2152;
}

.customization-toggle-btn-enabled {
  background-color: #269d5f;
  border: 2px solid #53b180;
  transition: background-color 0.3s, border 0.3s;
}

.customization-toggle-btn-enabled:hover {
  background-color: #29d67a;
}

.customization-options-btn {
  background-color: #5858587a;
  width: 100%;
  height: 40px;
  border: 2px solid #5858587a;
  margin-top: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  font-size: 15px;
  transition: background-color 0.3s, border 0.3s;
  cursor: pointer;
}

.customization-options-btn:hover {
  background-color: #6b6b6b7a;
  border: 2px solid #6b6b6b7a;
}
</style>
