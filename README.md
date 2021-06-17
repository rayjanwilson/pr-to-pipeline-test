# What is this

There are a few things that CDK Pipelines and CodePipeline don't support out of the box.
1. CodePipeline doesn't work for feature branch git strategy. It can only listen to changes in a single branch.
   1. We make a construct that builds a pipeline for a branch when a pull request is issued
2. CDK Pipeline doesn't remove artifact buckets when the pipeline is removed
   1. with feature branching, this quickly leads to a large number of orphaned s3 buckets

Additionally, we found it challenging to find examples of how to use ImageBuilder to make Docker images and AMIs from the pipeline.
This repo includes both as examples, including a way to automatically update the version numbers.