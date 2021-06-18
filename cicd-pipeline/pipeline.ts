import { Construct, SecretValue, Stack, StackProps, RemovalPolicy, PhysicalName } from '@aws-cdk/core';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { CdkPipeline, SimpleSynthAction, ShellScriptAction } from '@aws-cdk/pipelines';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { Bucket, BucketEncryption, BlockPublicAccess } from '@aws-cdk/aws-s3';
import { GenericAppStage } from './generic-app-stage';
import { CodebuildPrTrigger } from './codebuild-pr-trigger';
import { ImageBuilderDocker } from './imagebuilder-docker';

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

    // regular pipeline from here
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

    // this solves point 2,
    const artifactBucket = new Bucket(this, 'ArtifactsBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      encryption: BucketEncryption.KMS_MANAGED,
      blockPublicAccess: new BlockPublicAccess(BlockPublicAccess.BLOCK_ALL),
      removalPolicy: RemovalPolicy.DESTROY, // <--- when the stack gets destroyed this bucket now gets destroyed
      autoDeleteObjects: true, // <--- stands up a custom lambda resource
    });
    const custom_pipeline = new Pipeline(this, 'BsePipeline', {
      artifactBucket,
      restartExecutionOnUpdate: true,
    });

    const pipeline = new CdkPipeline(this, 'CICD', {
      codePipeline: custom_pipeline, // <--- injecting here
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
      singlePublisherPerType: true,
    });

    // end of point 2 solution

    if (props.github.branch === 'master' || props.github.branch === 'main') {
      new CodebuildPrTrigger(this, 'PrTrigger', { github: props.github });
      // add deployment to test account and to prod
    } else {
      // must be a feature branch
      const devStackOptions = { branch: props.github.branch };
      const devApp = new GenericAppStage(this, 'Dev', devStackOptions);
      // build and test typescript code
      const devStage = pipeline.addApplicationStage(devApp);

      const current_step_number = devStage.nextSequentialRunOrder();
      devStage.addActions(
        new ShellScriptAction({
          actionName: 'CDKUnitTests',
          runOrder: current_step_number,
          additionalArtifacts: [sourceArtifact],
          commands: ['npm install', 'npm run build', 'npm run test'],
        })
      );
      devStage.addActions(
        new ShellScriptAction({
          actionName: 'SecOps',
          runOrder: current_step_number,
          additionalArtifacts: [sourceArtifact],
          commands: ['npm install', 'npm run build', 'npm run test'],
        })
      );
    }

    new ImageBuilderDocker(this, 'IB_Docker', { branch: props.github.branch });
  }
}
