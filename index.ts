import {createInterface} from 'readline';

import {Reference, Commit} from 'nodegit';
import {prompt, ui} from 'inquirer';
import {Subject} from 'rxjs';

import {listBranches, getLatestCommitsForBranch} from './commands/branch';

const prompts = new Subject();

export async function main() {
  const branches = await listBranches(__dirname);
  const answers: {name?: string; answer?: any}[] = [];
  let previousBranch = branches.length && branches.pop();
  let x = 0;
  let numCommits = 5;

  prompt(prompts).ui.process.subscribe(
    answer => {
      let nextCurrentBranch;

      if (answer.answer === 'more') {
        nextCurrentBranch = previousBranch;
        numCommits += 5;
      } else {
        answers.push(answer);
        nextCurrentBranch = branches.length && branches.pop();
        numCommits = 5;
      }

      if (!nextCurrentBranch) {
        prompts.complete();
      } else {
        previousBranch = nextCurrentBranch;

        askQuestion(nextCurrentBranch, ++x, numCommits);
      }
    },
    e => console.log('Error occurred:', e),
    () => {
      console.log('Your answers were:', answers);
    },
  );

  const currentBranch = previousBranch; // branches.length && branches.pop();
  askQuestion(currentBranch, 0, numCommits);
}

async function askQuestion(
  branch: string,
  id: string | number,
  numCommits: number,
) {
  const commits = await getLatestCommitsForBranch(
    __dirname,
    branch,
    numCommits,
  );
  const branchPrompt = getPrompt(branch, id, commits);

  prompts.next(branchPrompt);
}

function getPrompt(branch: string, id: string | number, commits: Commit[]) {
  const commitInfo = commits
    .map(commit => {
      return `${commit.sha()}
      ${commit.date()}
      ${commit.author().name()} <${commit.author().email()}>

      ${commit.message()}`;
    })
    .join('\n\n');

  const message = `Showing last ${commits.length} commits for branch ${branch}:

  ${commitInfo}`;

  return {
    type: 'expand',
    message,
    name: `choice_${branch}_${id}`,
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
  };
}

main();
