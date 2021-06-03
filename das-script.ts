#!/usr/bin/env npx ts-node
import { execSync, exec } from 'child_process';

const destroy = (stack: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`i am destroying ${stack}`);
    return exec(`npx cdk destroy ${stack}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(error);
      } else if (stderr) {
        console.error(stderr);
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });

  //   console.log(outBuffer.toString());
  // console.log(`i would destroy ${stack}`);
};

const outBuffer = execSync('npx cdk list', { encoding: 'utf8' });
const out = outBuffer.toString();

const myarray = out.split('\n').filter(item => item !== '');
console.log(myarray);

const promises = myarray.map(stack => destroy(stack));
const results = Promise.all(promises);
console.log(results);
