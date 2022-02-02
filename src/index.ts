import {EOL} from 'os';

import {createInterface} from 'readline';

import {Reference, Commit} from 'nodegit';
import {prompt, ui} from 'inquirer';
import {Subject} from 'rxjs';
import {yellow, blue, white, bgGreen, red, green} from 'chalk';

import {listBranches, getLatestCommitsForBranch, deleteBranch} from './commands/branch';

const prompts = new Subject();

export async function main(repoPath: string = __dirname) {
  const branches = await listBranches(repoPath);
  const answers: {branchName: string; answer: string}[] = [];
  let finalAnswer: {name?: string; answer?: string};
  let previousBranch = branches.length && branches.pop();
  let x = 0;
  let numCommits = 5;

  prompt(prompts).ui.process.subscribe(
    (answer) => {
      let nextCurrentBranch: string;

      if (answer.answer === 'more') {
        nextCurrentBranch = previousBranch;
        numCommits += 5;
      } else if (answer.name !== 'final') {
        answers.push(formatAnswer(answer));
        nextCurrentBranch = branches.length && branches.pop();
        numCommits = 5;
      } else {
        finalAnswer = answer;
      }

      if (!nextCurrentBranch) {
        showSummary(answers);
      } else {
        previousBranch = nextCurrentBranch;

        askQuestion(repoPath, nextCurrentBranch, ++x, numCommits);
      }
    },
    (e) => console.log('Error occurred:', e),
    () => {
      const branchesToDelete = getBranchesToDelete(answers);
      const branchesToSkip = getBranchesToSkip(answers);

      if (finalAnswer?.answer === 'yes') {
        branchesToDelete.reduce<Promise<unknown>>(async (soFar, branchName) => {
          await soFar;

          console.log(`${red('Deleting branch')} ${bgGreen(branchName)}${red('...')}`);

          return deleteBranch(repoPath, branchName);
        }, Promise.resolve());
      }
    }
  );

  const currentBranch = previousBranch; // branches.length && branches.pop();
  askQuestion(repoPath, currentBranch, 0, numCommits);
}

function formatAnswer(answer: {name?: string; answer?: any}): {branchName: string; answer: string} {
  const branchNameParts = answer.name?.split('_');
  const branchName = branchNameParts.slice(1, branchNameParts.length - 1).join('_');

  return {branchName, answer: answer.answer};
}

function getBranchesToDelete(answers: {branchName: string; answer: string}[]) {
  return answers.filter((answer) => answer.answer === 'delete').map((answer) => answer.branchName);
}

function getBranchesToSkip(answers: {branchName: string; answer: string}[]) {
  return answers.filter((answer) => answer.answer === 'skip').map((answer) => answer.branchName);
}

function showSummary(answers: {branchName: string; answer: string}[]) {
  const branchesToDelete = getBranchesToDelete(answers);
  const branchesToSkip = getBranchesToSkip(answers);

  const message = [
    '',
    '',
    red('You have chosen to delete the following branches:'),
    '',
    `    ${yellow(branchesToDelete.join(`${EOL}    `))}`,
    '',
    green('The following branches were skipped:'),
    '',
    `    ${yellow(branchesToSkip.join(`${EOL}    `))}`,
    '',
    white('Do you want to continue?')
  ].join(EOL);

  prompts.next({
    type: 'expand',
    message,
    name: 'final',
    choices: [
      {key: 'y', name: 'Yes', value: 'yes'},
      {key: 'n', name: 'No', value: 'no'}
    ]
  });
  prompts.complete();
}

async function askQuestion(repoPath: string, branch: string, id: string | number, numCommits: number) {
  const commits = await getLatestCommitsForBranch(repoPath, branch, numCommits);
  const branchPrompt = getPrompt(branch, id, commits);

  prompts.next(branchPrompt);
}

function getPrompt(branch: string, id: string | number, commits: Commit[]) {
  const commitInfo = commits
    .map((commit) => {
      return [
        yellow(commit.sha()),
        white(`Author: ${commit.author().name()} <${commit.author().email()}>`),
        white(`Date:   ${commit.date()}`),
        '',
        `    ${white(commit.message())}`
      ].join(EOL);
    })
    .join(`${EOL}${EOL}`);

  const message = [
    '',
    '',
    `${blue('Branch name:')} ${bgGreen(branch)}`,
    blue(`Last ${commits.length} commits:`),
    '',
    commitInfo
  ].join(EOL);

  return {
    type: 'expand',
    message,
    name: `choice_${branch}_${id}`,
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
  };
}
