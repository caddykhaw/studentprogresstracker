# Contributing Guide

## Commit Message Format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages. This leads to more readable messages that are easy to follow when looking through the project history and enables automatic versioning and changelog generation.

A commit message should be structured as follows:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `type` and `subject` are mandatory, while the `scope`, `body`, and `footer` are optional.

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Scope

The scope provides additional contextual information about the commit change.

Examples:
- `feat(auth): add login form`
- `fix(student): correct date format in profile view`
- `docs(readme): update installation instructions`

### Using the Commit Template

A commit template is configured in this project. When you make a commit, your editor will open with the template. Fill it out according to the Conventional Commits format.

## Versioning and Releases

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for versioning and changelog generation.

### Making a Release

To create a new release:

1. Make sure all changes are committed and pushed to the main branch
2. Run the release script:
   ```
   npm run release
   ```
3. Push the new version tag to the repository:
   ```
   git push --follow-tags origin main
   ```

### Release Types

The type of version increment is determined automatically based on your commits:

- `feat` commits trigger a minor release (0.1.0 → 0.2.0)
- `fix` commits trigger a patch release (0.1.0 → 0.1.1)
- `BREAKING CHANGE` in commit footer triggers a major release (0.1.0 → 1.0.0)

### First Release

For the first release, you can use:

```
npm run release -- --first-release
```

### Specific Release Types

You can also specify the release type:

```
npm run release -- --release-as minor
npm run release -- --release-as major
npm run release -- --release-as patch
```

Or a specific version:

```
npm run release -- --release-as 1.1.0
``` 