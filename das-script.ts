#!/usr/bin/env npx ts-node
import { execSync } from 'child_process';

const destroy = (stack: string): void => {
  //   const outBuffer = execSync(`npx cdk destroy ${stack}`, { encoding: 'utf-8' });
  //   console.log(outBuffer.toString());
  console.log(`i would destroy ${stack}`);
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const outBuffer = execSync('npx cdk list', { encoding: 'utf8' });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const out = outBuffer.toString();

const myarray = out.split('\n').filter(item => item !== '');
console.log(myarray);

myarray.forEach(stack => destroy(stack));
