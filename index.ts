import {createInterface} from 'readline';

import {Reference} from 'nodegit';

import {listBranches, getLatestCommitsForBranch} from './commands/branch';

export async function main() {
  const branches = await listBranches('/Users/nthurow/Work/skyline/shared-component-library');

  return (branches as any[]).reduce<Promise<void>>((soFar: any, branch: any) => {
    const val = soFar.then(() => checkBranch(branch));
    return val as Promise<void>;
  }, Promise.resolve());
}

async function checkBranch(branch: any) {
  return new Promise(async (resolve, reject) => {
    console.log('Checking branch', (branch.name && branch.name()) || branch);

    const branchCommits = await getLatestCommitsForBranch(
      '/Users/nthurow/Work/skyline/shared-component-library',
      branch
    );

    branchCommits.forEach((commit) => {
      console.log(commit.sha());
      console.log('Author:', commit.author().name(), `<${commit.author().email()}>`);
      console.log('Date:', commit.date());
    });

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Continue? y/n', (answer) => {
      if (answer === 'y') {
        resolve();
      } else {
        reject();
      }
    });
  });
}

main();
