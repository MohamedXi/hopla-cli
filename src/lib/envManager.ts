import shell from 'shelljs';
import { EnvOptions } from '../types/options.js';
import { Logger } from './logger.js';

const logger = new Logger();

/**
 * Constructs a shell command string to execute an asdf command.
 *
 * This function returns a string that sources the asdf script and then
 * executes the specified asdf command.
 *
 * @param command - The asdf command to be executed.
 * @returns A string that can be used to execute the asdf command in a shell.
 */
function asdfCommand(command: string) {
  return `source "$HOME/.asdf/asdf.sh" && asdf ${command}`;
}

function installAsdf() {
  if (!shell.test('-d', `${process.env.HOME}/.asdf`)) {
    logger.info('Installing asdf for version management...');
    if (
      shell.exec(
        'git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2',
        { silent: false },
      ).code !== 0
    ) {
      logger.error('Failed to install asdf!');
      process.exit(1);
    }
    shell.exec('echo ". $HOME/.asdf/asdf.sh" >> ~/.bashrc');
    shell.exec('echo ". $HOME/.asdf/completions/asdf.bash" >> ~/.bashrc');
    logger.success('asdf installed successfully');
  } else {
    logger.info('asdf already installed');
  }
}

function installNodeVersion(nodeVersion: string) {
  logger.info(`Installing Node.js ${nodeVersion}...`);

  if (
    shell.exec(asdfCommand('plugin-list | grep nodejs'), { silent: true })
      .code !== 0
  ) {
    if (
      shell.exec(
        asdfCommand(
          'plugin-add nodejs https://github.com/asdf-vm/asdf-nodejs.git',
        ),
        { silent: false },
      ).code !== 0
    ) {
      logger.error('Failed to add asdf nodejs plugin');
      process.exit(1);
    }
  }

  if (
    shell.exec(asdfCommand(`install nodejs ${nodeVersion}`), { silent: false })
      .code !== 0
  ) {
    logger.error(`Failed to install Node.js ${nodeVersion}`);
    process.exit(1);
  }

  logger.success(`Node.js ${nodeVersion} installed successfully`);
}

function setNodeVersion(nodeVersion: string) {
  logger.info(`Switching to Node.js ${nodeVersion}...`);

  if (
    shell.exec(asdfCommand(`global nodejs ${nodeVersion}`), { silent: false })
      .code !== 0
  ) {
    logger.error(`Failed to switch to Node.js ${nodeVersion}`);
    process.exit(1);
  }

  if (shell.exec(asdfCommand('reshim nodejs'), { silent: false }).code !== 0) {
    logger.error(`Failed to reshim Node.js ${nodeVersion}`);
    process.exit(1);
  }

  logger.success(`Node.js version switched to ${nodeVersion}`);
}

function installJavaVersion(javaVersion: string) {
  logger.info(`Installing Java ${javaVersion}...`);

  if (
    shell.exec(asdfCommand('plugin-list | grep java'), { silent: true })
      .code !== 0
  ) {
    if (
      shell.exec(
        asdfCommand('plugin-add java https://github.com/halcyon/asdf-java.git'),
        { silent: false },
      ).code !== 0
    ) {
      logger.error('Failed to add asdf java plugin');
      process.exit(1);
    }
  }

  const installResult = shell.exec(asdfCommand(`install java ${javaVersion}`), {
    silent: false,
  });
  if (installResult.code !== 0) {
    logger.error(`Failed to install Java ${javaVersion}`);
    logger.error(
      'The specified Java version is not available or unknown. Please run the command again with a valid Java version according to the asdf-java plugin documentation.',
    );
    process.exit(1);
  }

  logger.success(`Java ${javaVersion} installed successfully`);
}

function setJavaVersion(javaVersion: string) {
  logger.info(`Switching to Java ${javaVersion}...`);

  if (
    shell.exec(asdfCommand(`global java ${javaVersion}`), { silent: false })
      .code !== 0
  ) {
    logger.error(`Failed to switch to Java ${javaVersion}`);
    process.exit(1);
  }

  logger.success(`Java version switched to ${javaVersion}`);
}

/**
 * Updates the global NPM version to the specified version.
 *
 * @param npmVersion - The version of NPM to update to.
 *
 * @remarks
 * This function uses the `shell.exec` method to run the `npm install -g npm@<version>` command.
 * If the command fails, it logs an error message and exits the process with a status code of 1.
 * If the command succeeds, it logs a success message.
 *
 * @example
 * ```typescript
 * updateNpm('7.20.0');
 * ```
 */
function updateNpm(npmVersion: string) {
  logger.info(`Updating NPM to v${npmVersion}...`);
  if (
    shell.exec(`npm install -g npm@${npmVersion}`, { silent: false }).code !== 0
  ) {
    logger.error(`Failed to update NPM to v${npmVersion}`);
    process.exit(1);
  }
  logger.success(`NPM updated to v${npmVersion}`);
}

/**
 * Sets the NPM registry to the specified URL.
 *
 * This function updates the NPM registry configuration to the provided URL
 * and logs the process. If the operation fails, it logs an error message
 * and exits the process with a non-zero status code.
 *
 * @param {string} npmRegistry - The URL of the NPM registry to set.
 * @throws Will exit the process with a status code of 1 if the command fails.
 */
function setNpmRegistry(npmRegistry: string) {
  logger.info(`Setting NPM registry to ${npmRegistry}...`);
  if (
    shell.exec(`npm set registry ${npmRegistry}`, { silent: false }).code !== 0
  ) {
    logger.error('Failed to set NPM registry');
    process.exit(1);
  }
  logger.success(`NPM registry set to ${npmRegistry}`);
}

/**
 * Logs into the specified Docker registry using the Docker CLI.
 *
 * @param {string} dockerRegistry - The URL or name of the Docker registry to log into.
 * @throws Will exit the process with code 1 if the login command fails.
 */
function loginDockerRegistry(dockerRegistry: string) {
  logger.info(`Logging into Docker registry ${dockerRegistry}...`);
  if (
    shell.exec(`docker login ${dockerRegistry}`, { silent: false }).code !== 0
  ) {
    logger.error('Failed to log into Docker registry');
    process.exit(1);
  }
  logger.success(`Docker registry set to ${dockerRegistry}`);
}

/**
 * Configures the environment for a given env based on the provided options.
 *
 * @param env - The name of the env for which the environment is being configured.
 * @param options - An object containing various environment configuration options.
 * @param options.node - The version of Node.js to install and configure (optional).
 * @param options.npm - The version of npm to update to (optional).
 * @param options.npmRegistry - The npm registry URL to set (optional).
 * @param options.dockerRegistry - The Docker registry credentials to login with (optional).
 *
 * @returns void
 */
export function switchEnvironment(env: string, options: EnvOptions) {
  logger.info(`Configuring environment for: ${env}`);

  installAsdf();

  if (options.npmRegistry) {
    setNpmRegistry(options.npmRegistry);
  }

  if (options.dockerRegistry) {
    loginDockerRegistry(options.dockerRegistry);
  }

  if (options.node) {
    installNodeVersion(options.node);
    setNodeVersion(options.node);
  }

  if (options.java) {
    installJavaVersion(options.java);
    setJavaVersion(options.java);
  }

  if (options.npm) {
    updateNpm(options.npm);
  }

  logger.success(`[Hopla] Environment ${env} configured successfully!`);
}

/**
 * Checks and logs the current environment configuration based on options.
 *
 * @param options - The options specifying which configuration values to display.
 */
export function checkCurrentEnvironment(options: EnvOptions) {
  if (options.node) {
    const nodeVersion = shell.exec('node -v', { silent: false }).stdout.trim();
    logger.info(`Node.js version: ${nodeVersion}`);
  }

  if (options.npm) {
    const npmVersion = shell.exec('npm -v', { silent: false }).stdout.trim();
    logger.info(`NPM version: ${npmVersion}`);
  }

  if (options.npmRegistry) {
    const npmRegistry = shell
      .exec('npm get registry', { silent: false })
      .stdout.trim();
    logger.info(`NPM registry: ${npmRegistry}`);
  }

  if (options.dockerRegistry) {
    const dockerInfo = shell
      .exec('docker info 2>/dev/null | grep "Registry"', { silent: false })
      .stdout.trim();
    logger.info(`Docker registry: ${dockerInfo || 'Not logged in'}`);
  }

  logger.success('Environment check completed.');
}
