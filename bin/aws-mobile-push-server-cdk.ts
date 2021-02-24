#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsMobilePushServerCdkStack } from '../lib/aws-mobile-push-server-cdk-stack';

const app = new cdk.App();
new AwsMobilePushServerCdkStack(app, 'AwsMobilePushServerCdkStack');
