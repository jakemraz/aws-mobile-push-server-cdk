import json

def register(event, context):
  print('register')
  
  return {
    'headers': { 'Content-Type': 'application/json'},
    'statusCode': 200,
    'body': json.dumps('hello')
  }