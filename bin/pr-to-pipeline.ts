#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PrToPipelineStack } from '../lib/pr-to-pipeline-stack';

const app = new cdk.App();
new PrToPipelineStack(app, 'PrToPipelineStack');
