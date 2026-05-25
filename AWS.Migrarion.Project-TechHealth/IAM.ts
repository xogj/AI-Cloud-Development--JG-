import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class IAMStackTechHealth extends cdk.Stack {
    public readonly ec2InstanceRole: iam.Role;
    public readonly rdsAdminRole: iam.Role;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.ec2InstanceRole = new iam.Role(this, 'EC2InstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
            ],
        });

        this.ec2InstanceRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['rds-db:connect'],
            resources: ['*'],
        }));

        this.rdsAdminRole = new iam.Role(this, 'RDSAdminRole', {
            assumedBy: new iam.AccountPrincipal(this.account),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRDSFullAccess'),
            ],
        });
    }
}
