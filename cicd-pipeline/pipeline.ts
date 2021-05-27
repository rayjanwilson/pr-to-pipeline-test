import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';

export interface Props extends StackProps {
  github: {
    owner: string;
    repo: string;
    branch: string;
  };
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const sourceArtifact = new Artifact();
    const cloudAssemblyArtifact = new Artifact();

    const sourceAction = new GitHubSourceAction({
      actionName: 'Source',
      oauthToken: SecretValue.secretsManager('github-token'),
      owner: props.github.owner,
      repo: props.github.repo,
      branch: props.github.branch,
      output: sourceArtifact,
    });

    const synthAction = SimpleSynthAction.standardNpmSynth({
      sourceArtifact,
      cloudAssemblyArtifact,
      buildCommand: 'npm run build',
      environmentVariables: {
        branch: { value: props.github.branch },
      },
    });

    new CdkPipeline(this, 'CICD', {
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
      // crossAccountKeys: false,
    });
  }
}
