import { createInterface } from "readline";

import { Reference, Commit } from "nodegit";
import { prompt, ui } from "inquirer";
import { Subject } from "rxjs";

import { listBranches, getLatestCommitsForBranch } from "./commands/branch";

const prompts = new Subject();

export async function main() {
  const branches = await listBranches(__dirname);
  const answers: { branchName: string; answer: string }[] = [];
  let finalAnswer: { name?: string; answer?: string };
  let previousBranch = branches.length && branches.pop();
  let x = 0;
  let numCommits = 5;

  prompt(prompts).ui.process.subscribe(
    (answer) => {
      let nextCurrentBranch: string;

      if (answer.answer === "more") {
        nextCurrentBranch = previousBranch;
        numCommits += 5;
      } else if (answer.name !== "final") {
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

        askQuestion(nextCurrentBranch, ++x, numCommits);
      }
    },
    (e) => console.log("Error occurred:", e),
    () => {
      const branchesToDelete = getBranchesToDelete(answers);
      const branchesToSkip = getBranchesToSkip(answers);

      if (finalAnswer?.answer === "yes") {
        branchesToDelete.forEach((branchName) => {
          console.log(`Deleting branch ${branchName}...`);
        });
      }
    }
  );

  const currentBranch = previousBranch; // branches.length && branches.pop();
  askQuestion(currentBranch, 0, numCommits);
}

function formatAnswer(answer: {
  name?: string;
  answer?: any;
}): { branchName: string; answer: string } {
  const branchNameParts = answer.name?.split("_");
  const branchName = branchNameParts
    .slice(1, branchNameParts.length - 1)
    .join("_");

  return { branchName, answer: answer.answer };
}

function getBranchesToDelete(
  answers: { branchName: string; answer: string }[]
) {
  return answers
    .filter((answer) => answer.answer === "delete")
    .map((answer) => answer.branchName);
}

function getBranchesToSkip(answers: { branchName: string; answer: string }[]) {
  return answers
    .filter((answer) => answer.answer === "skip")
    .map((answer) => answer.branchName);
}

function showSummary(answers: { branchName: string; answer: string }[]) {
  const branchesToDelete = getBranchesToDelete(answers);
  const branchesToSkip = getBranchesToSkip(answers);

  const message = `You have chosen to delete the following branches:

  ${branchesToDelete.join("\n")}

  The following branches were skipped:

  ${branchesToSkip.join("\n")}

  Do you want to continue?`;

  prompts.next({
    type: "expand",
    message,
    name: "final",
    choices: [
      { key: "y", name: "Yes", value: "yes" },
      { key: "n", name: "No", value: "no" }
    ]
  });
  prompts.complete();
}

async function askQuestion(
  branch: string,
  id: string | number,
  numCommits: number
) {
  const commits = await getLatestCommitsForBranch(
    __dirname,
    branch,
    numCommits
  );
  const branchPrompt = getPrompt(branch, id, commits);

  prompts.next(branchPrompt);
}

function getPrompt(branch: string, id: string | number, commits: Commit[]) {
  const commitInfo = commits
    .map((commit) => {
      return `${commit.sha()}
      ${commit.date()}
      ${commit.author().name()} <${commit.author().email()}>

      ${commit.message()}`;
    })
    .join("\n\n");

  const message = `Showing last ${commits.length} commits for branch ${branch}:

  ${commitInfo}`;

  return {
    type: "expand",
    message,
    name: `choice_${branch}_${id}`,
    choices: [
      {
        key: "d",
        name: "Delete",
        value: "delete"
      },
      {
        key: "s",
        name: "Skip",
        value: "skip"
      },
      {
        key: "m",
        name: "See More Commits",
        value: "more"
      },
      {
        key: "o",
        name: "Open in Github",
        value: "github"
      }
    ]
  };
}

main();
