import {Clone, Reference, Repository, Branch} from 'nodegit';
import {v4} from 'uuid';

export async function listBranches(repoPath: string) {
  const repo = await Repository.open(repoPath);
  const refs = await repo.getReferences();

  return refs
    .filter((ref) => {
      return ref.isBranch();
    })
    .map((ref) => {
      return ref.name();
    });
}

export async function getLatestCommitsForBranch(repoPath: string, branch: string | Reference, numCommits: number) {
  const repo = await Repository.open(repoPath);
  const commits = [await repo.getBranchCommit(branch)];

  for (let x = 1; x < numCommits; x++) {
    const commit = commits[commits.length - 1];

    if (commit.parentcount() > 0) {
      commits.push(await commit.parent(0));
    }
  }

  return commits;
}

export async function deleteBranch(repoPath: string, branch: string | Reference) {
  let branchToDelete: Reference;

  if (typeof branch === 'string') {
    const repo = await Repository.open(repoPath);
    branchToDelete = await Branch.lookup(repo, branch.replace('refs/heads/', ''), Branch.BRANCH.LOCAL);
  } else {
    branchToDelete = branch;
  }

  return branchToDelete.delete();
}
