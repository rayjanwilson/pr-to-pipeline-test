import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { CdkPipeline, SimpleSynthAction, ShellScriptAction } from '@aws-cdk/pipelines';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { GenericAppStage } from './generic-app-stage';

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

    const pipeline = new CdkPipeline(this, 'CICD', {
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
      // crossAccountKeys: false,
    });

    const devStackOptions = { branch: props.github.branch };
    const devApp = new GenericAppStage(this, 'Dev', devStackOptions);
    // build and test typescript code
    const devStage = pipeline.addApplicationStage(devApp);

    devStage.addActions(
      new ShellScriptAction({
        actionName: 'CDKUnitTests',
        runOrder: devStage.nextSequentialRunOrder(),
        additionalArtifacts: [sourceArtifact],
        commands: ['npm install', 'npm run build', 'npm run test'],
      })
    );
  }
}
