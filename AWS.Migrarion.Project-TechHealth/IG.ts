import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class IGStackTechHealth extends cdk.Stack {
    public readonly ig: ec2.CfnInternetGateway;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.ig = new ec2.CfnInternetGateway(this, 'IG', {
            tags: [{
                key: 'Name',
                value: 'IG'
            }]
        });
    }
}
