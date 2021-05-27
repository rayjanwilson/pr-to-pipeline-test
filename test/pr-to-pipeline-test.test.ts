import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { GenericAppStack } from '../lib/generic-app';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new GenericAppStack(app, 'MyTestStack');
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
