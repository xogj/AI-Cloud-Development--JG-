// EC2 Instance to host the app, ensuring that it is properly configured with the IAM roles assigned to it for security purposes.

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class EC2StackTechHealth extends cdk.Stack {
    public readonly ec2Instance: ec2.Instance;

    constructor(scope: Construct, id: string, vpc: ec2.IVpc, role: iam.IRole, securityGroup: ec2.ISecurityGroup, props?: cdk.StackProps) {
        super(scope, id, props);

        this.ec2Instance = new ec2.Instance(this, 'EC2Instance', {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage(),
            vpc: vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            role: role,
            securityGroup: securityGroup,
        });
    }
}
