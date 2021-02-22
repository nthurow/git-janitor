import {command} from 'yargs';

import {main} from './';

const args = command('Git Janitor', 'Clean up your old git branches')
  .option('repository', {alias: 'r', describe: 'Path to the desired repository'})
  .default('repository', process.cwd(), 'The process current working directory')
  .help().argv;

main(args.repository);
