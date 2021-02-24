import json
import boto3

client = boto3.client('sns')

def create_fcm_application(event, context):
  body = json.loads(event['body'])
  app_name = body['ApplicationName']
  platform = 'GCM'
  attributes = {
    'PlatformCredential': body['ApiKey']
  }

  response = client.create_platform_application(
    Name=app_name,
    Platform=platform,
    Attributes=attributes
  )
  
  return success(response)


def register(event, context):
  print(event)
  
  return success(event)

def success(message):
  return {
    'headers': { 'Content-Type': 'application/json'},
    'statusCode': 200,
    'body': json.dumps(message)
  }