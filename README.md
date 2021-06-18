[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Overview

There are a few things that CDK Pipelines and CodePipeline don't support out of the box.
1. CodePipeline doesn't work for feature branch git strategy. It can only listen to changes in a single branch.
  1. We make a construct that builds a pipeline for a branch when a pull request is issued
2. CDK Pipeline doesn't remove artifact buckets when the pipeline is removed
  1. with feature branching, this quickly leads to a large number of orphaned s3 buckets
3. Additionally, we found it challenging to find examples of how to use ImageBuilder to make Docker images and AMIs from the pipeline.
  1. This repo includes both as examples, including a way to automatically update the version numbers.

put the config.ts content into secrets manager and have the pipeline fetch it from there

## install pre-reqs

### multi-account bootstrap

- add programmatic access to your `~/.aws/credentials` for the test and prod accounts
- bootstrap the account the pipeline will be deployed to
  - `npx cdk bootstrap`
- run the following to bootstrap those accounts
  - `env CDK_NEW_BOOTSTRAP=1 npx cdk bootstrap --profile <PROFILENAME> --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --trust <ACCOUNT_PIPELINE_DEPLOYED_TO> aws://<ACCOUNT_FOR_TEST_OR_PROD>/<REGION>`
  - eg) `env CDK_NEW_BOOTSTRAP=1 npx cdk bootstrap --profile test --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --trust 173975140544 aws://636493737377/us-east-1`


# Todo
- How To (diagram workflow)  can grab from that blog post
- make the pipeline manual deployment because you don't always want it to be deployed, but i want the pipeline available in case
  - perspectives
    - cost
    - dev ease
    - security (hijacking, malicious inject, malicious iac deployments)
    - filter for who is able to auto-deploy