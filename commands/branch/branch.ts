import {Clone, Reference, Repository} from 'nodegit';
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

  return await repo.getReferences();
}

export async function getLatestCommitsForBranch(repoPath: string, branch: Reference, numCommits: number) {
  const repo = await Repository.open(repoPath);
  const commits = [await repo.getBranchCommit(branch)];

  for (let x = 1; x < numCommits; x++) {
    commits.push(await commits[commits.length - 1].parent(0));
  }

  return commits;
}
