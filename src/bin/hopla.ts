#!/usr/bin/env node

import { Command } from 'commander';
import {
  checkCurrentEnvironment,
  switchEnvironment
} from '../lib/envManager.js';
import { Logger } from '../lib/logger.js';
import { EnvOptions } from '../types/options.js';

const program = new Command();
const logger = new Logger();

program
  .name('Hopla')
  .description('Hopla is a flexible environment switcher CLI')
  .version('0.1.1')
  .helpOption('-h, --help', 'Display help for command');

program
  .command('env <env>')
  .description('Switch to a specific environment dynamically')
  .option(
    '--java <version>',
    'Specifies the Java version to install and switch to. Use SDKMAN! version identifiers (e.g., `17.0.14-amzn`, `11.0.11-adpt`)'
  )
  .option(
    '--node <version>',
    'Specifies the node.js version to install (e.g., `14.17.3`)'
  )
  .option(
    '--npm <version>',
    'Specifies the NPM version to use (e.g., `7.24.0`)'
  )
  .option(
    '--npm-registry <url>',
    'Sets the NPM registry URL (e.g., `https://registry.npmjs.org`)'
  )
  .option(
    '--docker-registry <url>',
    'Sets the Docker registry URL for login (e.g., `docker.io`)'
  )
  .action((env: string, options: EnvOptions) => {
    logger.info(`🔧 Configuring environment for: ${env}\n`);
    switchEnvironment(env, options);
  });

program
  .command('current')
  .description('Check the current environment configuration')
  .option('--node', 'Show current Node.js version')
  .option('--npm', 'Show current NPM version')
  .option('--npm-registry', 'Show current NPM registry')
  .option('--docker-registry', 'Show current Docker registry')
  .action((options) => {
    logger.info('🔍 Checking current environment configuration:\n');
    checkCurrentEnvironment(options);
  });

program.parse(process.argv);
