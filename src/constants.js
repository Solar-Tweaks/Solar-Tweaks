import { homedir } from 'os';
import { join } from 'path';

export default {
  links: {
    GH_DISCUSSIONS: 'https://github.com/orgs/Solar-Tweaks/discussions',
    GITHUB: 'https://github.com/Solar-Tweaks/',
    YOUTUBE: 'https://www.youtube.com/channel/UCXRhlF3x02Sc8hgWnCMXnTQ',
    LUNARCLIENT: 'https://lunarclient.com/',
    SERVER_STATUS_ENDPOINT: 'https://mcapi.us/server/status',
    LC_METADATA_ENDPOINT: 'https://api.lunarclientprod.com/launcher/launch',
  },
  API_URL: 'https://server.solartweaks.com/api',
  PATCHER: {
    PATCHER: 'solar-patcher.jar',
    CONFIG: 'config.json',
    CONFIG_EXAMPLE_URL:
      'https://raw.githubusercontent.com/Solar-Tweaks/SolarPatcher/main/config.example.json',
  },
  UPDATERS: {
    INDEX: '/updater/index',
    LAUNCHER: '/updater/?item=launcher&version={version}',
    PATCHER: '/updater/?item=patcher&version={version}',
  },
  ENDPOINTS: {
    LAUNCH: '/launch',
  },
  DOTLUNARCLIENT: join(homedir(), '.lunarclient'),
  SOLARTWEAKS_DIR: join(homedir(), '.lunarclient', 'solartweaks'),
};
