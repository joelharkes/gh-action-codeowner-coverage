# CODEOWNERS coverage check

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action can:

- Check if all files are covered by a CODEOWNERS Rule
- Check if all modified files are covered by a CODEOWNERS Rule. (PR)
- Check if all CODEOWNER rules are used.

## Examples

### Check all files

```yaml
steps:
  - uses: actions/checkout@v4
  - name: CODEOWNERS Check
    id: test-action
    uses: joelharkes/gh-action-codeowner-coverage@v1
    with:
      includeGitignore: 'false'
      ignoreDefault: 'false'
      allRulesMustHit: 'true' # Action will fail if there is a rule that is not used.
```

### PR Check modifield files

```yaml
name: CODEOWNERS Check on modified files

on:
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  codeowners:
    runs-on: ubuntu-latest
    name: Test changed-files
    steps:
      - uses: actions/checkout@v4
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v45

      - name: CODEOWNERS Check
        id: test-action
        uses: joelharkes/gh-action-codeowner-coverage@v1
        with:
          files: ${{ steps.changed-files.outputs.all_changed_files }}
          includeGitignore: 'false'
          ignoreDefault: 'false'
```

### Outputs example

```yaml
steps:
  - uses: actions/checkout@v4
  - name: CODEOWNERS Check
    id: codeowners
    uses: joelharkes/gh-action-codeowner-coverage@v1
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.codeowners.outputs.missedFiles }}"
```

### Contributing

See: [typescript-action template](https://github.com/actions/typescript-action)
on how to run, test and contribute to GitHub Actions.
