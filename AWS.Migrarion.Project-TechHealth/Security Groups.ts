import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class SecurityGroupsStackTechHealth extends cdk.Stack {
    public readonly securitygroups: ec2.SecurityGroup;
    public readonly rdsSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, vpc: ec2.IVpc, props?: cdk.StackProps) {
        super(scope, id, props);

        this.securitygroups = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc: vpc,
            securityGroupName: 'EC2 SG for Tech Health',
            description: 'Security for EC2 instance',
            allowAllOutbound: true,
        });

        this.securitygroups.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'allow HTTPS traffic from anywhere'
        );

        this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
            vpc: vpc,
            securityGroupName: 'RDS SG for Tech Health',
            description: 'Security for RDS Instance',
            allowAllOutbound: false,
        });

        this.rdsSecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(this.securitygroups.securityGroupId),
            ec2.Port.tcp(3306),
            'allow MySQL traffic from EC2 instance only'
        );
    }
}
