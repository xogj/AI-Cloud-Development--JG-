import * as cdk from 'aws-cdk-lib';
import { VpcsCDKProjectStack } from '../VPC';

const app = new cdk.App();
new VpcsCDKProjectStack(app, 'VpcsCDKProjectStack');
