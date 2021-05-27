import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as PrToPipeline from '../lib/pr-to-pipeline-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new PrToPipeline.PrToPipelineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
