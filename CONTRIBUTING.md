# Contributing to Dandi

## Coding rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes must be tested by one or more unit tests.
* Dandi uses [Typedoc](https://typedoc.org/guides/doccomments/) to generate documentation. All public APIs must be
  documented, with examples where applicable to show intended and recommended usage patterns.
  * Use `@internal` and/or `@ignore` as applicable on non-public APIs
* Submission must be lint-free (run `npm run lint` or `yarn lint` to show errors)
 
## Commit Message Format

Dandi attempts to follow similar rules and conventions as
[Angular](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#rules).

* Dandi uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.3/#specification), so commit
  messages must follow the specification, ESPECIALLY those for breaking change
* `feat` and `fix` commits must specify a scope. The scopes Dandi uses are the published npm scope and package name:
  * `dandi/cache`
  * `dandi/common`
  * `dandi/config`
  * `dandi/core`
  * `dandi/core-node`
  * `dandi/data`
  * `dandi/hal`
  * `dandi/logging`
  * `dandi/model`
  * `dandi/model-builder`
  * `dandi/mvc`
  * `dandi/mvc-hal`
  * `dandi/mvc-view`
  * `dandi-contrib/aws-lambda`
  * `dandi-contrib/config-aws-ssm`
  * `dandi-contrib/mvc-auth-firebase`
  * `dandi-contrib/mvc-express`
  * `dandi-contrib/mvc-view-ejs`
  * `dandi-contrib/mvc-view-pug`
* Non-`feat`/`fix` commits should use a scope if applicable
* Please use `git rebase` to squash commits into logical units - don't mix disparate or unrelated changes into the same
  commit

### Commit Message Subject

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end
