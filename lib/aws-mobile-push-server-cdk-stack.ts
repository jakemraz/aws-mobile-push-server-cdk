import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as path from 'path';

export class AwsMobilePushServerCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, 'PushTokenManagementApi');
    const v1 = api.root.addResource('v1');

    const table = new ddb.Table(this, 'PushTokenManagementTable', {
      partitionKey: {
        name: 'UserId',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'Token',
        type: ddb.AttributeType.STRING
      }
    })
    const snsFullAccessPolicy = iam.ManagedPolicy.fromManagedPolicyArn(this, 'AmazonSNSFullAccess',
      'arn:aws:iam::aws:policy/AmazonSNSFullAccess');
    const createFcmAppFunction = new lambda.Function(this, 'CreateFcmAppFunction', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.create_fcm_application',
      code: lambda.Code.fromAsset(path.join(__dirname, 'function')),
    });
    createFcmAppFunction.role?.addManagedPolicy(snsFullAccessPolicy);

    const createFcmAppInteg = new apigw.LambdaIntegration(createFcmAppFunction);
    const createFcmApp = v1.addResource('app');
    const createFcmAppPost = createFcmApp.addMethod('POST', createFcmAppInteg);

    const registerFunction = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.register',
      code: lambda.Code.fromAsset(path.join(__dirname, 'function')),
      environment: {
        TOKEN_TABLE: table.tableName,
        ACCOUNT_NO: this.account
      }
    });
    registerFunction.role?.addManagedPolicy(snsFullAccessPolicy);
    table.grantFullAccess(registerFunction);
    
    const registerInteg = new apigw.LambdaIntegration(registerFunction);
    const register = v1.addResource('register');
    const registerPost = register.addMethod('POST', registerInteg);

  }
}
