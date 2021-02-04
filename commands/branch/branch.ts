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

export async function getLatestCommitsForBranch(repoPath: string, branch: Reference) {
  const repo = await Repository.open(repoPath);
  const headCommit = await repo.getBranchCommit(branch);
  const parent1 = await headCommit.parent(0);
  const parent2 = await parent1.parent(0);
  const parent3 = await parent2.parent(0);
  const parent4 = await parent3.parent(0);

  return [headCommit, parent1, parent2, parent3, parent4];
}
