import { Construct } from '@aws-cdk/core';
import { CfnContainerRecipe, CfnComponent } from '@aws-cdk/aws-imagebuilder';
import { Repository } from '@aws-cdk/aws-ecr';

export class ImageBuilderDocker extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const temp_ecr = new Repository(this, 'TempRepo');

    const generic_component = new CfnComponent(this, 'GenericComponent', {
      name: 'generic-container-image-component',
      platform: 'Linux',
      version: '1.0.0',
    });

    const Recipe = new CfnContainerRecipe(this, 'ExImage', {
      name: 'AmazonLinux2-Container-Recipe',
      version: '1.0.0',
      parentImage: 'amazonlinux:latest',
      containerType: 'DOCKER',
      components: [{ componentArn: generic_component.attrArn }],
      targetRepository: { repositoryName: temp_ecr.repositoryName },
    });
  }
}
