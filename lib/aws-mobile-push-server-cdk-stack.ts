import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

export class AwsMobilePushServerCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new ddb.Table(this, 'PushTokenManagementTable', {
      partitionKey: {
        name: 'Id',
        type: ddb.AttributeType.STRING
      }
    })

    const registerFunction = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.register',
      code: lambda.Code.fromAsset(path.join(__dirname, 'function')),
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    table.grantFullAccess(registerFunction);
    

    const api = new apigw.RestApi(this, 'PushTokenManagementApi');
    const registerInteg = new apigw.LambdaIntegration(registerFunction);

    const v1 = api.root.addResource('v1');
    const register = v1.addResource('register');
    const registerPost = register.addMethod('GET', registerInteg);

    
  }
}
