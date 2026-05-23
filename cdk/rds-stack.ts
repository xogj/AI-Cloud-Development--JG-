import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface RDSStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class RDSStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: RDSStackProps) {
        super(scope, id, props);

        const instance = new rds.DatabaseInstance(this, 'myRDSInstance', {
            engine: rds.DatabaseInstanceEngine.mysql({
                version: rds.MysqlEngineVersion.VER_8_0_40
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED
            }
        });

        cdk.Tags.of(instance).add('Name', 'MyRDSInstance');
    }
}
