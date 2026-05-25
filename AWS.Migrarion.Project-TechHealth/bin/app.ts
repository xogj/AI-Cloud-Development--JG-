import * as cdk from 'aws-cdk-lib';
import { VPCStacktechhealth } from '../VPC';
import { IGStackTechHealth } from '../IG';
import { IAMStackTechHealth } from '../IAM';
import { SecurityGroupsStackTechHealth } from '../Security Groups';
import { EC2StackTechHealth } from '../EC2';
import { RDSStackTechhealth } from '../RDS';

const app = new cdk.App();

const env: cdk.Environment = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const vpcStack = new VPCStacktechhealth(app, 'TechHealth-VPCStack', { env });

const igStack = new IGStackTechHealth(app, 'TechHealth-IGStack', { env });

const iamStack = new IAMStackTechHealth(app, 'TechHealth-IAMStack', { env });

const sgStack = new SecurityGroupsStackTechHealth(app, 'TechHealth-SGStack', vpcStack.vpc, { env });
sgStack.addDependency(vpcStack);

const ec2Stack = new EC2StackTechHealth(
    app,
    'TechHealth-EC2Stack',
    vpcStack.vpc,
    iamStack.ec2InstanceRole,
    sgStack.securitygroups,
    { env }
);
ec2Stack.addDependency(vpcStack);
ec2Stack.addDependency(iamStack);
ec2Stack.addDependency(sgStack);

const rdsStack = new RDSStackTechhealth(
    app,
    'TechHealth-RDSStack',
    vpcStack.vpc,
    sgStack.rdsSecurityGroup,
    { env }
);
rdsStack.addDependency(vpcStack);
rdsStack.addDependency(sgStack);
