import * as cdk from '@aws-cdk/core';

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

    console.log(github);

    console.log(`lets build a pipeline for ${github.branch}`);

    // if the branch is master then we update the pr codebuild thing
    // pr codebuild goes here

    // pipeline goes here
  }
}
