import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcsCDKProjectStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.vpc = new ec2.Vpc(this, 'VPC', {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },

                {
                    name: 'Database',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 24
                }
            ],
        });

        new cdk.CfnOutput(this, 'VPCId', {
            value: this.vpc.vpcId,
            description: 'VPC ID'
        })
    }
}