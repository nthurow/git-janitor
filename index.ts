import {createInterface} from 'readline';

import {Reference, Commit} from 'nodegit';
import {prompt, ui} from 'inquirer';
import {Subject} from 'rxjs';

import {listBranches, getLatestCommitsForBranch} from './commands/branch';

const prompts = new Subject();

function nextQuestion(answer, currentQuestion, nextQuestion) {
  if (answer.answer === 'more') {
    prompts.next(currentQuestion);
  } else {
    prompts.next(nextQuestion);
  }
}

export async function main() {
  const bottomBar = new ui.BottomBar();
  const branches = await listBranches(__dirname);
  let previousBranch = branches.length && branches.pop();
  let x = 0;

  prompt(prompts).ui.process.subscribe(answer => {
    bottomBar.log.write('Previous answer: ' + answer.answer);
    //console.log(answer);

    let nextCurrentBranch;

    if (answer.answer === 'more') {
      nextCurrentBranch = previousBranch;
    } else {
      nextCurrentBranch = branches.length && branches.pop();
    }

    /*
    console.log('Previous branch:', getBranchName(previousBranch));
    console.log('Next branch:', getBranchName(nextCurrentBranch));
    */

    if (!nextCurrentBranch) {
      prompts.complete();
    } else {
      previousBranch = nextCurrentBranch;
      //console.log('Propmoting...');
      prompts.next({
        type: 'expand',
        message: `What do you want to do with branch ${getBranchName(
          nextCurrentBranch,
        )}?`,
        name: `choice_${getBranchName(nextCurrentBranch)}_${x++}`,
        choices: [
          {key: 'd', name: 'Delete', value: 'delete'},
          {key: 'm', name: 'More', value: 'more'},
        ],
      });
    }
  });

  const currentBranch = previousBranch; // branches.length && branches.pop();

  prompts.next({
    type: 'expand',
    message: `What do you want to do with branch ${getBranchName(
      currentBranch,
    )}?`,
    name: `choice_${getBranchName(currentBranch)}`,
    choices: [
      {key: 'd', name: 'Delete', value: 'delete'},
      {key: 'm', name: 'More', value: 'more'},
    ],
  });
}
/*
export async function main() {
  const branches = await listBranches('/Users/nthurow/Work/skyline/shared-component-library');

  return (branches as any[]).reduce<Promise<void>>((soFar: any, branch: any) => {
    const val = soFar.then(() => callCheckBranch(branch));
    return val as Promise<void>;
  }, Promise.resolve());
}
*/

function getBranchName(branch: Reference | string) {
  return typeof branch !== 'string' ? branch.name() : branch;
}

async function callCheckBranch(branch: any, numCommits = 5) {
  // const bottomBar = new ui.BottomBar();
  const branchName = (branch.name && branch.name()) || branch;
  const commits = await getLatestCommitsForBranch(
    '/Users/nthurow/Work/skyline/shared-component-library',
    branch,
    numCommits,
  );
  const answers = await checkBranch(branch, commits);

  console.log(getLogStatus(answers.action, branchName));
  // bottomBar.log.write(getLogStatus(answers.test, branchName));

  if (answers.action === 'more') {
    return callCheckBranch(branch, numCommits * 2);
  } else if (answers.action === 'github') {
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

async function checkBranch(branch: any, commits: Commit[]) {
  const branchName = (branch.name && branch.name()) || branch;

  const commitInfo = commits
    .map(commit => {
      return `${commit.sha()}
      ${commit.date()}
      ${commit.author().name()} <${commit.author().email()}>

      ${commit.message()}`;
    })
    .join('\n\n');

  const message = `Showing last commits for branch ${branchName}:

  ${commitInfo}`;

  return prompt([
    {
      type: 'expand',
      message,
      name: 'action',
      choices: [
        {
          key: 'd',
          name: 'Delete',
          value: 'delete',
        },
        {
          key: 's',
          name: 'Skip',
          value: 'skip',
        },
        {
          key: 'm',
          name: 'See More Commits',
          value: 'more',
        },
        {
          key: 'o',
          name: 'Open in Github',
          value: 'github',
        },
      ],
    },
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
