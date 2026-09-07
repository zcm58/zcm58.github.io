# Roll Back the Neural Constellation Homepage

The source immediately before the redesign is preserved at
`pre-neural-home-2026-09-07`, commit
`bb7b5923a853eb14f27e57391457f179294ffcac`.
The completed redesign is tagged `neural-home-2026-09-07`.

To undo this redesign, use a new revert commit and the normal website updater.
This preserves published Git history and allows the redesign to be restored
later. Run from the repository root; these guards require `main` and a clean
working tree:

```powershell
if ((git branch --show-current) -ne "main") { throw "Switch to main first." }
if (git status --porcelain) { throw "Preserve your current changes first." }
```

Continue only if neither guard reports an error. The publish helper includes
all current source changes. Run each command below in order and stop if any
command reports an error:

```powershell
git pull --ff-only
git fetch origin tag pre-neural-home-2026-09-07
git fetch origin tag neural-home-2026-09-07
git revert --no-edit neural-home-2026-09-07
git diff --check
git push origin main
quarto run publish-website.ts
```

The explicit push publishes the revert commit to `main`; the updater only
pushes source when it finds uncommitted changes. The updater then clean-renders,
publishes `gh-pages`, and checks the deployed version. Inspect the restored
homepage at desktop and phone widths. If the redesign is the only source change since the baseline,
the following should print nothing after the revert:

```powershell
git diff pre-neural-home-2026-09-07 HEAD --
```

If later commits changed the same files, the revert may need conflict
resolution. Review those changes instead of discarding them. Use
`git revert --abort` to cancel an unresolved revert and return to the state
before starting it. Do not reset `main` or force-push to roll back the website.
