import { Construct } from '@aws-cdk/core';

export interface Props {
  dockerfile: string;
}

export class ImageBuilderDocker extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    // create an image builder
    // configure it to point to a dockerfile
  }
}
