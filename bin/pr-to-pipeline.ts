#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../cicd-pipeline/pipeline';

const github = {
  owner: 'rayjanwilson',
  repo: 'pr-to-pipeline-test',
  branch: 'master',
};

if (process.env.CODEBUILD_WEBHOOK_HEAD_REF) {
  console.log(`i can see the branch is ${process.env.CODEBUILD_WEBHOOK_HEAD_REF}`);
  github.branch = process.env.CODEBUILD_WEBHOOK_HEAD_REF.split('/').pop() || 'master';
}

const app = new cdk.App();
new PipelineStack(app, `PR2P-${github.branch}`, { github });
