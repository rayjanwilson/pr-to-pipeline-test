import { Construct, Stack, CfnOutput } from '@aws-cdk/core';
import {
  CfnContainerRecipe,
  CfnComponent,
  CfnInfrastructureConfiguration,
  CfnDistributionConfiguration,
  CfnImage,
} from '@aws-cdk/aws-imagebuilder';
import { Repository } from '@aws-cdk/aws-ecr';
// import { Vpc } from '@aws-cdk/aws-ec2';
import { CfnInstanceProfile, Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { readFileSync } from 'fs';

export interface Props {
  branch: string;
}
export class ImageBuilderDocker extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { region } = Stack.of(scope);

    let suffix = '';
    if (!props?.branch) {
      suffix = 'Main';
    } else if (props.branch == 'main') {
      suffix = 'Main';
    } else {
      suffix = `Issue-${props.branch.split('-')[0]}`;
    }

    const temp_ecr = new Repository(this, 'TempRepo', {
      imageScanOnPush: true,
    });

    const generic_component = new CfnComponent(this, 'GenericComponent', {
      name: `generic-container-image-component-${suffix}`,
      platform: 'Linux',
      version: '1.0.0',
      data: readFileSync('./docker/component.yaml').toString(),
    });

    const recipe = new CfnContainerRecipe(this, 'ExImage', {
      name: `AmazonLinux2-Container-Recipe-${suffix}`,
      version: '1.0.0',
      parentImage: 'amazonlinux:latest',
      containerType: 'DOCKER',
      components: [{ componentArn: generic_component.attrArn }],
      targetRepository: {
        service: 'ECR',
        repositoryName: temp_ecr.repositoryName,
      },
      dockerfileTemplateData:
        'FROM {{{ imagebuilder:parentImage }}}\n{{{ imagebuilder:environments }}}\n{{{ imagebuilder:components }}}\n',
    });

    const role = new Role(this, 'instancerole', {
      roleName: 'IBrole',
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ManagedPolicy.fromAwsManagedPolicyName('EC2InstanceProfileForImageBuilderECRContainerBuilds'),
      ],
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      path: '/executionServiceEC2Role/',
    });
    const instanceprofile = new CfnInstanceProfile(this, 'instance_profile', {
      path: '/executionServiceEC2Role/',
      roles: [role.roleName],
    });

    const infrastructure = new CfnInfrastructureConfiguration(this, 'Infra', {
      name: 'imagebuilder_infra',
      instanceProfileName: instanceprofile.ref,
      instanceTypes: ['t3.xlarge'],
      terminateInstanceOnFailure: false,
      // subnetId: build_vpc.privateSubnets[0].subnetId,
    });

    const distribution = new CfnDistributionConfiguration(this, 'distrib', {
      name: 'Generic-Container-DistributionConfiguration',
      description:
        'This distribution configuration will deploy our container image to the desired target ECR repository in the current region',
      distributions: [
        {
          region: region,
          containerDistributionConfiguration: {
            TargetRepository: {
              Service: 'ECR',
              RepositoryName: temp_ecr.repositoryName,
            },
          },
        },
      ],
    });

    const IBDockerImage = new CfnImage(this, `IBImage-${suffix}`, {
      containerRecipeArn: recipe.ref,
      infrastructureConfigurationArn: infrastructure.ref,
      distributionConfigurationArn: distribution.ref,
      imageTestsConfiguration: {
        imageTestsEnabled: true,
        timeoutMinutes: 60,
      },
    });

    new CfnOutput(this, 'recipe ref', {
      exportName: `recipeRef-${suffix}`,
      value: recipe.ref,
    });
  }
}
