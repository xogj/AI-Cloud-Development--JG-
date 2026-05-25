//RDS placed in a private subnet to enhance security, ensuring that the database is not directly accessible from the internet.

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';

export class RDSStackTechhealth extends cdk.Stack {
    public readonly rdsInstance: rds.DatabaseInstance;

    constructor(scope: Construct, id: string, vpc: ec2.IVpc, securityGroup: ec2.ISecurityGroup, props?: cdk.StackProps) {
        super(scope, id, props);

        const monitoringRole = new iam.Role(this, 'RDSMonitoringRole', {
            assumedBy: new iam.ServicePrincipal('monitoring.rds.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonRDSEnhancedMonitoringRole'),
            ],
        });

        this.rdsInstance = new rds.DatabaseInstance(this, 'RDSInstance', {
            engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
            vpc: vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
            databaseName: 'TechHealthDB',
            credentials: rds.Credentials.fromGeneratedSecret('admin'),
            securityGroups: [securityGroup],
            iamAuthentication: true,
            monitoringInterval: cdk.Duration.seconds(60),
            monitoringRole: monitoringRole,
            deletionProtection: true,
        });
    }
}
