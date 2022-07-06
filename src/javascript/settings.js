import settings from 'electron-settings';
import { join } from 'path';
import * as process from 'process';
import { platform } from 'process';
import Logger from './logger';
const logger = new Logger('settings');

/**
 * Setup settings for the application
 * Also check if the settings need to be reseted to default
 */
export default async function setupSettings() {
  logger.info('Setting up settings...');

  // User's submitted servers
  if (!(await settings.has('servers'))) {
    await settings.set('servers', defaultSettings.servers);
  }

  // User's selected customizations
  if (!(await settings.has('customizations'))) {
    await settings.set('customizations', defaultSettings.customizations);
  }

  // User's selected version
  if (!(await settings.has('version'))) {
    await settings.set('version', defaultSettings.version);
  }

  // User's selected launch directories
  if (!(await settings.has('launchDirectories'))) {
    await settings.set('launchDirectories', defaultSettings.launchDirectories);
  } else {
    const directories = await settings.get('launchDirectories');
    const old = directories.find((d) => d.version === '1.8');
    if (old) old.version = '1.8.9';
    await settings.set('launchDirectories', directories);
  }

  // User's selected ram
  if (!(await settings.has('ram'))) {
    await settings.set('ram', defaultSettings.ram);
  }

  // User's selected resolution
  if (!(await settings.has('resolution'))) {
    await settings.set('resolution', defaultSettings.resolution);
  }

  // User's selected action after launch
  if (!(await settings.has('actionAfterLaunch'))) {
    await settings.set('actionAfterLaunch', defaultSettings.actionAfterLaunch);
  }

  // User's custom JVM arguments
  if (!(await settings.has('jvmArguments'))) {
    await settings.set('jvmArguments', defaultSettings.jvmArguments);
  }

  // User's selected JRE Path
  if (!(await settings.has('jrePath'))) {
    await settings.set('jrePath', defaultSettings.jrePath);
  }

  // Launch in debug mode
  if (!(await settings.has('debugMode'))) {
    await settings.set('debugMode', defaultSettings.debugMode);
  }

  // Skip launch checks
  if (!(await settings.has('skipChecks'))) {
    await settings.set('skipChecks', defaultSettings.skipChecks);
  }

  // Downloaded JREs
  if (!(await settings.has('downloadedJres'))) {
    await settings.set('downloadedJres', defaultSettings.downloadedJres);
  }

  logger.info('Settings setup');
}

export function getDotMinecraftDirectory() {
  switch (platform) {
    case 'win32':
      return join(process.env.APPDATA, '.minecraft');
    case 'darwin':
      return join(
        process.env.HOME,
        'Library',
        'Application Support',
        'minecraft'
      );
    case 'linux':
      return join(process.env.HOME, '.minecraft');
    default:
      break;
  }
}

export const defaultSettings = {
  servers: [
    { name: 'Hypixel', ip: 'hypixel.net', background: 7 },
    { name: 'Minemen Club', ip: 'na.minemen.club', background: 3 },
    { name: 'Lunar Network', ip: 'lunar.gg', background: 1 },
    { name: 'ViperMC', ip: 'play.vipermc.net', background: 5 },
    { name: 'BWHub', ip: 'bwhub.net', background: 4 },
  ],
  customizations: [],
  version: '1.8.9',
  launchDirectories: [
    { version: '1.7', path: getDotMinecraftDirectory() },
    { version: '1.8.9', path: getDotMinecraftDirectory() },
    { version: '1.12', path: getDotMinecraftDirectory() },
    { version: '1.16', path: getDotMinecraftDirectory() },
    { version: '1.17', path: getDotMinecraftDirectory() },
    { version: '1.18', path: getDotMinecraftDirectory() },
  ],
  ram: 4000,
  resolution: {
    width: 854,
    height: 480,
  },
  actionAfterLaunch: 'close',
  jvmArguments: '-XX:+DisableAttachMechanism',
  jrePath:
    platform === 'win32'
      ? join(
          process.env.USERPROFILE,
          '.lunarclient',
          'jre',
          'zulu17.30.15-ca-fx-jre17.0.1-win_x64',
          'bin'
        )
      : join(
          process.env.HOME,
          '.lunarclient',
          'jre',
          'zulu17.30.15-ca-fx-jre17.0.1-win_x64',
          'bin'
        ),
  debugMode: false,
  skipChecks: false,
  downloadedJres: [],
};
