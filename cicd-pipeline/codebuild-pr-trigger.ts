import { Construct } from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export interface Props {
  github: {
    owner: string;
    repo: string;
    branch: string;
  };
}
export class CodebuildPrTrigger extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const gitHubSource = codebuild.Source.gitHub({
      owner: props.github.owner,
      repo: props.github.repo,
      cloneDepth: 1,
      webhook: true, // optional, default: true if `webhookFilters` were provided, false otherwise
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED)
          .andBranchIsNot('master')
          .andBranchIsNot('main'),
      ], // optional, by default all pushes and Pull Requests will trigger a build
    });

    const pr_trigger_project = new codebuild.Project(this, 'PrTriggerProject', {
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });
    const statement = new PolicyStatement();
    statement.addActions('cloudformation:*');
    statement.addResources('*');
    pr_trigger_project.addToRolePolicy(statement);
  }
}
