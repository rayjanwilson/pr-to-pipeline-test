import { Construct, Stack } from '@aws-cdk/core';
import {
  CfnContainerRecipe,
  CfnComponent,
  CfnInfrastructureConfiguration,
  CfnDistributionConfiguration,
  CfnImage,
} from '@aws-cdk/aws-imagebuilder';
import { Repository } from '@aws-cdk/aws-ecr';
import { Vpc } from '@aws-cdk/aws-ec2';
import { CfnInstanceProfile, Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { readFileSync } from 'fs';
export class ImageBuilderDocker extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { region } = Stack.of(scope);

    const temp_ecr = new Repository(this, 'TempRepo', {
      imageScanOnPush: true,
    });

    const generic_component = new CfnComponent(this, 'GenericComponent', {
      name: 'generic-container-image-component',
      platform: 'Linux',
      version: '1.0.0',
      data: readFileSync('./docker/component.yaml').toString(),
    });

    const recipe = new CfnContainerRecipe(this, 'ExImage', {
      name: 'AmazonLinux2-Container-Recipe',
      version: '1.0.0',
      parentImage: 'amazonlinux:latest',
      containerType: 'DOCKER',
      components: [{ componentArn: generic_component.attrArn }],
      targetRepository: { repositoryName: temp_ecr.repositoryName },
      dockerfileTemplateData:
        'FROM {{{ imagebuilder:parentImage }}}\n{{{ imagebuilder:environments }}}\n{{{ imagebuilder:components }}}\n',
    });

    const role = new Role(this, 'instancerole', {
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ManagedPolicy.fromAwsManagedPolicyName('EC2InstanceProfileForImageBuilderECRContainerBuilds'),
      ],
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      path: '/executionServiceEC2Role/',
    });
    const instanceprofile = new CfnInstanceProfile(this, 'instance_profile', {
      path: '/executionServiceEC2Role/',
      roles: [role.roleArn],
    });
    const build_vpc = new Vpc(this, 'vpc');
    const infrastructure = new CfnInfrastructureConfiguration(this, 'Infra', {
      name: 'imagebuilder_infra',
      instanceProfileName: instanceprofile.ref,
      instanceTypes: ['t4.micro'],
      terminateInstanceOnFailure: false,
    });

    const distribution = new CfnDistributionConfiguration(this, 'distrib', {
      name: 'Generic-Container-DistributionConfiguration',
      description:
        'This distribution configuration will deploy our container image to the desired target ECR repository in the current region',
      distributions: [
        {
          region: region,
          containerDistributionConfiguration: {
            Repository: temp_ecr.repositoryName,
          },
        },
      ],
    });

    const IBImage = new CfnImage(this, 'IBImage', {
      imageRecipeArn: recipe.attrArn,
      infrastructureConfigurationArn: infrastructure.attrArn,
      distributionConfigurationArn: distribution.attrArn,
      imageTestsConfiguration: {
        imageTestsEnabled: true,
        timeoutMinutes: 20,
      },
    });
  }
}
