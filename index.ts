import {createInterface} from 'readline';

import {Reference} from 'nodegit';
import {prompt, ui} from 'inquirer';

import {listBranches, getLatestCommitsForBranch} from './commands/branch';

export async function main() {
  const branches = await listBranches('/Users/nthurow/Work/skyline/shared-component-library');

  return (branches as any[]).reduce<Promise<void>>((soFar: any, branch: any) => {
    const val = soFar.then(() => callCheckBranch(branch));
    return val as Promise<void>;
  }, Promise.resolve());
}

async function callCheckBranch(branch: any) {
  // const bottomBar = new ui.BottomBar();
  const branchName = (branch.name && branch.name()) || branch;
  const answers = await checkBranch(branch);

  console.log(getLogStatus(answers.test, branchName));
  // bottomBar.log.write(getLogStatus(answers.test, branchName));

  if (answers.test === 'more' || answers.test === 'github') {
    return callCheckBranch(branch);
  }
}

function getLogStatus(res: string, branchName: string) {
  switch (res) {
    case 'delete':
      return `Deleted branch ${branchName}`;
      break;
    case 'skip':
      return `Skipped branch ${branchName}`;
      break;
    case 'more':
      return `Here is a bunch more commits!`;
      // return checkBranch(branch);
      break;
    case 'github':
      return `Opening in Github...`;
      // return checkBranch(branch);
      break;
  }
}

async function checkBranch(branch: any) {
  const branchName = (branch.name && branch.name()) || branch;

  return prompt([
    {
      type: 'expand',
      message: `Checking branch ${branchName}`,
      name: 'test',
      choices: [
        {
          key: 'd',
          name: 'Delete',
          value: 'delete'
        },
        {
          key: 's',
          name: 'Skip',
          value: 'skip'
        },
        {
          key: 'm',
          name: 'See More Commits',
          value: 'more'
        },
        {
          key: 'o',
          name: 'Open in Github',
          value: 'github'
        }
      ]
    }
  ]);
  /*
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
*/
}

main();
