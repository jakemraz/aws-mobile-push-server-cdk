import json
import boto3
import os

sns = boto3.client('sns')
ddb = boto3.resource('dynamodb')
table = ddb.Table(os.environ['TOKEN_TABLE'])
account_no = os.environ['ACCOUNT_NO']
region = boto3.Session().region_name

def create_fcm_application(event, context):
  body = json.loads(event['body'])
  app_name = body['ApplicationName']
  platform = 'GCM'
  attributes = {
    'PlatformCredential': body['ApiKey']
  }

  response = sns.create_platform_application(
    Name=app_name,
    Platform=platform,
    Attributes=attributes
  )
  
  return success(response)


def register(event, context):
  print(event)
  body = json.loads(event['body'])
  
  app_name = body['ApplicationName']
  user_id = body['UserId']
  token = body['Token']
  response = table.put_item(
    Item={
      'UserId':user_id,
      'Token':token
    }
  )
  print(response)

  app_arn = f'arn:aws:sns:{region}:{account_no}:app/GCM/{app_name}'
  print(app_arn)
  response = sns.create_platform_endpoint(
    PlatformApplicationArn=app_arn,
    Token=token
  )
  print(response)
  
  return success(response)

def success(message):
  return {
    'headers': { 'Content-Type': 'application/json'},
    'statusCode': 200,
    'body': json.dumps(message)
  }