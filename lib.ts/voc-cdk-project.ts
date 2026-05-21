import * as cdk from 'aws-cdk-lib';
import { VpcsCDKProjectStack } from './VPC';
import { EC2Stack } from './ec2-stack';

const app = new cdk.App();
const vpcStack = new VpcsCDKProjectStack(app, 'VpcProjectstack', {

});

new EC2Stack(app, 'MyECSStack', {
    vpc: vpcStack.vpc
});

app.synth();
