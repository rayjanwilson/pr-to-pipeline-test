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
        codebuild.FilterGroup.inEventOf(
          codebuild.EventAction.PULL_REQUEST_CREATED,
          codebuild.EventAction.PULL_REQUEST_REOPENED
        ),
      ], // optional, by default all pushes and Pull Requests will trigger a build
    });

    const pr_trigger_project = new codebuild.Project(this, 'Project', {
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });
    const statement1 = new PolicyStatement();
    statement1.addActions('cloudformation:*');
    statement1.addResources('*');
    const statement2 = new PolicyStatement();
    statement2.addActions('ssm:*');
    statement2.addResources('*');
    pr_trigger_project.addToRolePolicy(statement1);
    pr_trigger_project.addToRolePolicy(statement2);
  }
}
