#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as path from "path"
import { BackendStack } from "../lib/backendStack"

const app = new cdk.App();

export const RESOURCES = {
    backend: path.join(__dirname, "../../backend/build")
}

export const APP_NAME = "foobartest"

new BackendStack(app, 'BackendStack');
