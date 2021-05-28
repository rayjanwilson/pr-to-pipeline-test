#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { existsSync, readFileSync } from 'fs';
import { PipelineStack } from '../cicd-pipeline/pipeline';

const github = {
  owner: 'rayjanwilson',
  repo: 'pr-to-pipeline-test',
  branch: 'master',
};

if (process.env.CODEBUILD_WEBHOOK_HEAD_REF) {
  console.log(`i can see the branch is ${process.env.CODEBUILD_WEBHOOK_HEAD_REF}`);
  github.branch = process.env.CODEBUILD_WEBHOOK_HEAD_REF.split('/').pop() || 'master';
} else if (existsSync('pr_branch.txt')) {
  const data = readFileSync('pr_branch.txt', 'utf-8');
  github.branch = data.split('/').pop() || 'master';
} else if (process.env.branch) {
  console.log(`woah i see env var branch is ${process.env.branch}`);
  github.branch = process.env.branch;
}

const app = new cdk.App();
new PipelineStack(app, `PR2P-${github.branch}`, { github });
