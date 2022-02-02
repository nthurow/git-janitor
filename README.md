# git-janitor

Reduce git clutter by cleaning up old git branches.

## Why

Over time, many branches can accumulate in a git repository.  Some of them may be abandoned features, or PoC's, or someone else's branch that you checked out to try out their code.  `git-janitor` is a tool to help you review your current branches and delete any that are no longer needed.  No longer will you need to scour 10 pages of output from `git branch` to find that one branch that you were working on last week.

## Installation and Usage

Using [`yarn dlx`](https://yarnpkg.com/cli/dlx):

```
$ yarn dlx @nthurow/git-janitor
```

Using [`npx`](https://docs.npmjs.com/cli/v8/commands/npx):

```
$ npx @nthurow/git-janitor
```

When executed using the above commands, `git-janitor` will examine the branches for the git repository in the current directory.  It will show you the name of the branch as well as the last 5 commits on that branch.  You can then choose what to do with the branch:

- `d`: Delete the branch
- `s`: Skip (do not delete) the branch
- `m`: See more commits
- `o`: Open the branch in GitHub (not yet implemented!)
- `h`: View these options

After examining each branch, you will be presented with a final summary of which branches will be deleted and which ones will be ignored.  Once you respond in the affirmative to the prompt, the branches will be deleted.  No branches are deleted until this final step, so if you Ctrl-C the program before you get to the end, nothing will have been deleted.

## Additional Options

To run `git-janitor` against a repository in a different directory, use the `--repository` flag to specify the directory which contains the git repo.

## Future Work

- remove dependency on `nodegit`, or figure out a way to speed up build times
- check if branch tip already exists upstream and display a message if it does so that you know it is safe to delete locally
- implement "Open in GitHub" option which would open a browser pointing to the current branch in GitHub
- add option to "skip remaining branches" so that you don't have to evaulate every single branch before you can delete any of them
- skip default branch (master/main/etc.)
- skip currently active branch
- show status bar ("checking branch XX of YY")
