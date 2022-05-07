import axios from 'axios';
import { spawn } from 'child_process';
import { remote } from 'electron';
import settings from 'electron-settings';
import extractZip from 'extract-zip';
import { readFile, stat, writeFile } from 'fs/promises';
import { machineId as _machineId } from 'node-machine-id';
import { arch } from 'os';
import { join } from 'path';
import process from 'process';
import constants from '../constants';
import store from '../store';
import { downloadLunarAssets } from './assets';
import { disableRPC, login as connectRPC, updateActivity } from './discord';
import { downloadAndSaveFile } from './downloader';
import fs from './fs';
import Logger, { createMinecraftLogger } from './logger';

const logger = new Logger('launcher');

/**
 * Checks if the `.lunarclient` directory is valid
 */
export async function setupLunarClientDirectory() {
  logger.info('Checking .lunarclient directory');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING LC FOLDER...',
    icon: 'fa-solid fa-folder',
  });

  const folders = ['licenses', 'offline', 'jre'];

  if (!(await fs.exists(constants.DOTLUNARCLIENT))) {
    logger.debug('Creating .lunarclient directory...');
    await fs
      .mkdir(constants.DOTLUNARCLIENT)
      .then(() => {
        logger.debug('Created .lunarclient directory');
      })
      .catch((error) => {
        logger.error("Can't create .lunarclient directory", error);
      });
  }

  logger.debug('Checking .lunarclient subdirectories');

  for (const index in folders) {
    const folder = folders[index];

    // Launch state
    store.commit('setLaunchingState', {
      title: 'LAUNCHING...',
      message: `CHECKING SUBFOLDERS ${parseInt(index) + 1}/${folders.length}`,
      icon: 'fa-solid fa-folder',
    });

    if (!(await fs.exists(join(constants.DOTLUNARCLIENT, folder)))) {
      logger.debug(`Creating ${folder} subdirectory...`);
      await fs
        .mkdir(join(constants.DOTLUNARCLIENT, folder))
        .then(() => {
          logger.debug(`Created ${folder} subdirectory`);
        })
        .catch((error) => {
          logger.error(`Can't create ${folder} subdirectory`, error);
        });
    }
  }
}

/**
 * Checks if the JRE is valid
 */
export async function checkJRE() {
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING JRE...',
    icon: 'fa-solid fa-folder',
  });

  const jrePath = await settings.get('jrePath');
  const javaName = process.platform === 'win32' ? 'java.exe' : 'java';

  const exists = {
    jre: await stat(jrePath).catch(() => false), // Bin folder
    java: await stat(join(jrePath, javaName)).catch(() => false), // Java binary
  };

  // If one of them is missing
  if (!exists.jre || !exists.java) {
    logger.warn(
      'JRE not found! Showing error dialog and aborting launch process'
    );

    const choice = await remote.dialog.showMessageBox({
      type: 'error',
      title: 'JRE not found',
      message:
        'The JRE you selected was not found or is invalid.\n\nPlease select a valid JRE in the settings page or download one using the JRE downloader.\n\nMake sure you selected the bin folder inside of the JRE.',
      buttons: ['Select JRE', 'Cancel launch'],
    });

    if (choice.response === 0) {
      // Set new folder
      const folder = await remote.dialog.showOpenDialog({
        title: `Select the new JRE for Lunar Client (Select the bin folder)`,
        defaultPath: jrePath,
        properties: ['dontAddToRecent', 'openDirectory'],
      });

      if (folder.canceled) return;

      await settings.set('jrePath', folder.filePaths[0]);
      await checkJRE();
    } else {
      // Cancel launch or closed
      store.commit('setLaunchingState', {
        title: `LAUNCH ${await settings.get('version')}`,
        message: 'READY TO LAUNCH',
        icon: 'fa-solid fa-gamepad',
      });
      store.commit('setLaunching', false);
      throw new Error('JRE not found');
    }
  }
}

/**
 * Fetches metadata from Lunar's API
 * @param {boolean} [skipLaunchingState=false] Skip or not the launching state
 * @returns {Promise<Object>}
 */
export async function fetchMetadata(skipLaunchingState = false) {
  if (!skipLaunchingState) {
    // Launch state
    store.commit('setLaunchingState', {
      title: 'LAUNCHING...',
      message: 'FETCHING METADATA...',
      icon: 'fa-solid fa-download',
    });
  }

  // Fetch metadata
  logger.info('Fetching metadata...');
  const machineId = await _machineId();
  const version = await settings.get('version');
  return new Promise((resolve, reject) => {
    axios
      .post(
        constants.links.LC_METADATA_ENDPOINT,
        {
          hwid: machineId,
          os: process.platform,
          arch: arch(),
          version: version,
          branch: 'master',
          launch_type: 'OFFLINE',
          classifier: 'optifine',
        },
        { 'Content-Type': 'application/json', 'User-Agent': 'SolarTweaks' }
      )
      .then((response) => {
        logger.debug('Fetched metadata');
        resolve(response.data);
      })
      .catch((error) => {
        logger.error('Failed to fetch metadata', error);
        reject(error);
      });
  });
}

/**
 * Checks license (and downloads if needed)
 * @param {Object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function checkLicenses(metadata) {
  logger.info('Checking licenses...');
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: `CHECKING ${metadata.licenses.length} LICENSES ...`,
    icon: 'fa-solid fa-gavel',
  });
  for (const index in metadata.licenses) {
    const license = metadata.licenses[index];
    logger.debug(
      `Checking license ${parseInt(index) + 1}/${metadata.licenses.length}`
    );
    const licensePath = join(
      constants.DOTLUNARCLIENT,
      'licenses',
      license.file
    );

    if (!(await fs.exists(licensePath))) {
      await downloadAndSaveFile(
        license.url,
        join(constants.DOTLUNARCLIENT, 'licenses', license.file),
        'text',
        license.sha1,
        'sha1'
      ).catch((error) => {
        logger.error(`Failed to download ${license.file}`, error);
      });
    }
  }
}

/**
 * Checks the game files (and downloads if needed)
 * @param {Object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function checkGameFiles(metadata) {
  logger.info(`Checking game files (MC ${await settings.get('version')})...`);
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: `CHECKING GAMEFILES (${metadata.launchTypeData.artifacts.length})...`,
    icon: 'fa-solid fa-file',
  });

  if (
    !(await fs.exists(
      join(constants.DOTLUNARCLIENT, 'offline', await settings.get('version'))
    ))
  ) {
    await fs
      .mkdir(
        join(constants.DOTLUNARCLIENT, 'offline', await settings.get('version'))
      )
      .catch((error) => {
        logger.error('Failed to create version folder', error);
      });
  }

  for (const index in metadata.launchTypeData.artifacts) {
    const artifact = metadata.launchTypeData.artifacts[index];
    const gameFilePath = join(
      constants.DOTLUNARCLIENT,
      'offline',
      await settings.get('version'),
      artifact.name
    );
    logger.debug(
      `Checking game file ${parseInt(index) + 1}/${
        metadata.launchTypeData.artifacts.length
      }`
    );

    if (!(await fs.exists(gameFilePath))) {
      await downloadAndSaveFile(
        artifact.url,
        join(
          constants.DOTLUNARCLIENT,
          'offline',
          await settings.get('version'),
          artifact.name
        ),
        'blob',
        artifact.sha1,
        'sha1'
      ).catch((error) => {
        logger.error(`Failed to download ${artifact.name}`, error);
      });
    }
  }
}

/**
 * Checks natives (and extract if needed)
 * @param {object} metadata Metadata from Lunar's API
 * @returns {Promise<void>}
 */
export async function checkNatives(metadata) {
  logger.info('Checking natives...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING NATIVES...',
    icon: 'fa-solid fa-file',
  });

  const artifact = metadata.launchTypeData.artifacts.find(
    (artifact) => artifact.type === 'NATIVES'
  );
  if (
    await fs.exists(
      join(
        constants.DOTLUNARCLIENT,
        'offline',
        await settings.get('version'),
        artifact.name
      )
    )
  ) {
    if (
      !(await fs.exists(
        join(
          constants.DOTLUNARCLIENT,
          'offline',
          await settings.get('version'),
          'natives'
        )
      ))
    ) {
      await extractZip(
        join(
          constants.DOTLUNARCLIENT,
          'offline',
          await settings.get('version'),
          artifact.name
        ),
        {
          dir: join(
            constants.DOTLUNARCLIENT,
            'offline',
            await settings.get('version'),
            'natives'
          ),
        }
      )
        .then(() => {
          logger.debug('Extracted natives');
        })
        .catch((error) => {
          logger.error(`Failed to extract natives`, error);
        });
    } else {
      logger.debug('Natives already extracted');
    }
  } else {
    logger.error('Natives not found, this should not happen');
  }
}

/**
 * Check patcher (and download if needed)
 * @returns {Promise<void>}
 */
export async function checkPatcher() {
  logger.info('Checking patcher...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'CHECKING PATCHER...',
    icon: 'fa-solid fa-file',
  });

  const release = await axios
    .get(`${constants.API_URL}${constants.UPDATERS.INDEX}`)
    .catch((reason) => {
      logger.error('Failed to fetch updater index', reason);
    });

  const patcherPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    'solar-patcher.jar'
  );

  // Check if file solar-patcher.jar exists
  if (
    !(await stat(
      join(constants.SOLARTWEAKS_DIR, constants.PATCHER.PATCHER)
    ).catch(() => false))
  ) {
    await downloadAndSaveFile(
      `${constants.API_URL}${constants.UPDATERS.PATCHER.replace(
        '{version}',
        release.data.index.stable.patcher
      )}`,
      patcherPath,
      'blob'
    );
    await settings.set('patcherVersion', release.data.index.stable.patcher);
    return; // No need to check for updates, we just downloaded the latest version
  }

  const patcherVer = await settings.get('patcherVersion');
  const latestVer = release.data.index.stable.patcher;

  if (patcherVer === latestVer)
    return logger.info(`Patcher is up to date ${patcherVer}`);

  await downloadAndSaveFile(
    `${constants.API_URL}${constants.UPDATERS.PATCHER.replace(
      '{version}',
      release.data.index.stable.patcher
    )}`,
    patcherPath,
    'blob'
  );

  logger.info(`Patcher updated to ${latestVer}`);
  await settings.set('patcherVersion', latestVer);

  logger.debug('Updating config.json file to match new patcher config...');
  const defaultConfigFile = (
    await axios.get(constants.PATCHER.CONFIG_EXAMPLE_URL)
  ).data;

  const configPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.CONFIG
  );
  const config = await readFile(configPath, 'utf8');

  function merge(obj1, obj2) {
    const newObj = { ...obj1, ...obj2 };
    for (const key in newObj)
      if (typeof newObj[key] === 'object')
        newObj[key] = merge(obj1[key], obj2[key]);

    return newObj;
  }

  const newConfig = merge(defaultConfigFile, JSON.parse(config));
  await writeFile(configPath, JSON.stringify(newConfig, null, 2));
}

/**
 * Check patcher config file (and download if needed)
 * @returns {Promise<void>}
 */
export async function checkPatcherConfig() {
  const configPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.CONFIG
  );
  await stat(configPath).catch(async () => {
    console.log('Creating config file');
    await downloadAndSaveFile(
      constants.PATCHER.CONFIG_EXAMPLE_URL,
      configPath,
      'text'
    ).catch(console.error);
    logger.info('Created default patcher config');
  });
}

/**
 * Edit the `config.json` file for the Java Agent
 * @returns {Promise<void>}
 */
export async function patchGame() {
  logger.info('Patching game...');

  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'PATCHING GAME...',
    icon: 'fa-solid fa-cog',
  });

  const filePath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.CONFIG
  );

  logger.debug(`Reading ${filePath}`);
  const configRaw = await fs.readFile(filePath).catch((reason) => {
    logger.error('Failed to read config.json', reason);
  });
  if (!configRaw) return;

  const config = JSON.parse(configRaw);
  const customizations = await settings.get('customizations');

  config.metadata.removeCalls = [];
  config.metadata.isEnabled = true;

  customizations.forEach((customization) => {
    // Privacy module
    if (Object.prototype.hasOwnProperty.call(customization, 'privacyModules')) {
      customization.privacyModules.forEach((module) => {
        if (!Object.prototype.hasOwnProperty.call(config, module)) return;
        config[module].isEnabled = customization.enabled;
      });
      return;
    }

    if (!Object.keys(config).includes(customization.internal)) return;

    // Metadata module
    if (customization.internal === 'metadata') {
      config.metadata.removeCalls.push(customization.call);
      return;
    }

    config[customization.internal].isEnabled = customization.enabled;
    if (Object.prototype.hasOwnProperty.call(customization, 'values')) {
      for (const key in customization.values) {
        config[customization.internal][key] = customization.values[key];
      }
    }
  });

  logger.debug(`Writing ${filePath}`);
  await fs
    .writeFile(filePath, JSON.stringify(config, null, 2))
    .then(() => {
      logger.debug('Successfully wrote config.json');
    })
    .catch((reason) => {
      logger.error('Failed to write config.json', reason);
    });
}

/**
 * Get the Java arguments to launch the game
 * @param {Object} metadata Metadata from Lunar's API
 * @param {string} [serverIp=null] Server IP to connect to
 * @param {string} [overrideVersion=null] Version to use (overrides settings)
 * @param {boolean} [shortcut=false] Whether or not the arguments are for a shortcut
 */
export async function getJavaArguments(
  metadata,
  serverIp = null,
  overrideVersion = null,
  shortcut = false
) {
  const natives = join(
    constants.DOTLUNARCLIENT,
    'offline',
    await settings.get('version'),
    'natives'
  );

  const args = [...metadata.jre.extraArguments];

  const nativesArgument = args.findIndex((value) => value.includes('natives'));
  args[nativesArgument] = args[nativesArgument].replace(
    'natives',
    `"${natives}"`
  );

  let version = await settings.get('version');
  if (overrideVersion) version = overrideVersion;

  const lunarJarFile = async (filename) =>
    `"${join(constants.DOTLUNARCLIENT, 'offline', version, filename)}"`;

  const gameDir = (await settings.get('launchDirectories')).find(
    (directory) => directory.version === version
  ).path;

  const resolution = await settings.get('resolution');
  const patcherPath = join(
    constants.DOTLUNARCLIENT,
    'solartweaks',
    constants.PATCHER.PATCHER
  );

  // Make sure the patcher exists, or else the game will crash (jvm init error)
  stat(patcherPath)
    .then(() =>
      args.push(
        `-javaagent:"${patcherPath}"="${join(
          constants.DOTLUNARCLIENT,
          'solartweaks',
          constants.PATCHER.CONFIG
        )}"`
      )
    )
    .catch((e) =>
      logger.warn(
        `Not adding patcher in arguments; ${patcherPath} does not exist! ${e}`
      )
    );

  const classPath = [
    await lunarJarFile('lunar-assets-prod-1-optifine.jar'),
    await lunarJarFile('lunar-assets-prod-2-optifine.jar'),
    await lunarJarFile('lunar-assets-prod-3-optifine.jar'),
    await lunarJarFile('lunar-prod-optifine.jar'),
    await lunarJarFile('lunar-libs.jar'),
    await lunarJarFile('vpatcher-prod.jar'),
    await lunarJarFile('Optifine.jar'),
  ];

  if (version === '1.7')
    classPath.push(await lunarJarFile('OptiFine_1.7.10_HD_U_E7'));

  args.push(
    ...(await settings.get('jvmArguments')).split(' '),
    `-Xmx${await settings.get('ram')}m`,
    `-Djava.library.path="${natives}"`,
    `-Dsolar.launchType=${shortcut ? 'shortcut' : 'launcher'}`,
    '-cp',
    classPath.join(process.platform == 'win32' ? ';' : ':'),
    metadata.launchTypeData.mainClass,
    '--version',
    version,
    '--accessToken',
    '0',
    '--assetIndex',
    version === '1.7' ? '1.7.10' : version,
    '--userProperties',
    '{}',
    '--gameDir',
    `"${gameDir}"`,
    // '--assetsDir',
    // `"${join(gameDir, 'assets')}"`,
    '--texturesDir',
    `"${join(constants.DOTLUNARCLIENT, 'textures')}"`,
    '--width',
    resolution.width,
    '--height',
    resolution.height
  );

  if (serverIp) args.push('--server', `"${serverIp}"`);

  return args.map((arg) => (!shortcut ? `${arg}`.replace(/"/g, '') : arg));
}
/**
 * Launch the game
 * @param {Object} metadata Metadata from Lunar's API
 * @param {string} [serverIp=null] Server IP to connect to
 * @param {boolean} [debug=false] Launch in debug mode (show console)
 */
export async function launchGame(metadata, serverIp = null, debug = false) {
  store.commit('setLaunchingState', {
    title: 'LAUNCHING...',
    message: 'STARTING JVM...',
    icon: 'fa-solid fa-gamepad',
  });

  const version = await settings.get('version');
  const args = await getJavaArguments(metadata, serverIp);

  logger.debug('Launching game with args', args);

  const javaPath = join(await settings.get('jrePath'), 'java');
  const proc = await spawn(javaPath, args, {
    cwd: join(constants.DOTLUNARCLIENT, 'offline', version),
    detached: true,
    shell: debug,
  });

  async function commitLaunch() {
    updateActivity('In the launcher');
    store.commit('setLaunchingState', {
      title: `LAUNCH ${version}`,
      message: 'READY TO LAUNCH',
      icon: 'fa-solid fa-gamepad',
    });
    store.commit('setLaunching', false);
  }

  if (debug) return await commitLaunch();

  proc.on('error', (error) => {
    logger.error(error);
  });

  proc.stdout.on('error', (error) => {
    logger.error('Failed to launch game', error);
  });

  proc.stderr.on('error', (error) => {
    logger.error('Failed to launch game', error);
  });

  proc.stdout.once('end', () => {
    remote.getCurrentWindow().show();
    connectRPC();
  });

  proc.stdout.once('data', async (/* data */) => {
    await disableRPC();
    switch (await settings.get('actionAfterLaunch')) {
      case 'close':
      default:
        remote.getCurrentWindow().close();
        break;
      case 'hide':
        remote.getCurrentWindow().hide();
        break;
      case 'keep':
        break;
    }
    setTimeout(async () => {
      await commitLaunch();
    }, 1500);
  });

  const minecraftLogger = await createMinecraftLogger(version);
  logger.debug(
    `Created Minecraft Logger for version ${version}. Log file path: ${minecraftLogger.path}`
  );
  proc.stdout.pipe(minecraftLogger);
  proc.stderr.pipe(minecraftLogger);
}

/**
 * Run all the checks and launch the game
 * @param {string} [serverIp=null] Server IP to connect to
 */
// eslint-disable-next-line no-unused-vars
export async function checkAndLaunch(serverIp = null) {
  store.commit('setLaunching', true);
  updateActivity('In the launcher', 'Launching game');

  // Fetching metadata
  const metadata = await fetchMetadata().catch((error) => {
    store.commit('setLaunchingState', {
      title: 'Error',
      message: error.message,
      icon: 'fa-solid fa-exclamation-triangle',
    });
  });

  if (!(await settings.get('skipChecks'))) {
    // Check JRE
    await checkJRE();

    // Check game directory
    await setupLunarClientDirectory();

    // Check licenses
    await checkLicenses(metadata);

    // Check game files
    await checkGameFiles(metadata);

    // Check natives
    await checkNatives(metadata);

    // Check LC assets
    await downloadLunarAssets(metadata);

    // Check patcher
    await checkPatcher().catch((error) =>
      logger.error('Failed to check patcher, skipping patcher check.', error)
    );

    // Patcher config
    await checkPatcherConfig().catch(() =>
      logger.error(
        'Failed to check patcher config, is GitHub down? Have we messed up while publishing the release? Skipping patcher check.'
      )
    );
  }

  // Update patcher config file
  await patchGame();

  // Launch game
  await launchGame(metadata, serverIp, await settings.get('debugMode'));

  // Trackers
  const version = await settings.get('version');
  await axios
    .post(`${constants.API_URL}${constants.ENDPOINTS.LAUNCH}`, {
      item: 'launcher',
      version: version === '1.18' ? '1.18.1' : version,
    })
    .catch((error) =>
      logger.warn(
        "Failed to track launcher launch, ignoring it, it's not important.",
        error
      )
    );
}
