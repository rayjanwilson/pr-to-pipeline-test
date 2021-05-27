import * as cdk from '@aws-cdk/core';
// import { existsSync, readFileSync } from 'fs';

export class PrToPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const github = {
      owner: 'rayjanwilson',
      repo: 'pr-to-pipeline-test',
      branch: 'master',
    };

    if (process.env.CODEBUILD_WEBHOOK_HEAD_REF) {
      console.log(`i can see the branch is ${process.env.CODEBUILD_WEBHOOK_HEAD_REF}`);
      github.branch = process.env.CODEBUILD_WEBHOOK_HEAD_REF.split('/').pop() || 'master';
    }

    // const pr_file = 'pr_trigger.txt';
    // if (existsSync(pr_file)) {
    //   const data = readFileSync(pr_file, 'utf-8');
    //   console.log(data);

    //   github.branch = data.split('/')[-1];
    // }
    console.log(github);

    console.log(`lets build a pipeline for ${github.branch}`);
  }
}
