const AWS = require("aws-sdk")
const path = require('path')
require("dotenv").config({path: path.join(__dirname, ".env.integrationTest")})

const setupAWS = (containerUrl) => {
    const agent = require("proxy-agent")(containerUrl)
    AWS.config.region = "us-east-1"
    AWS.config.httpOptions = {agent, proxy: containerUrl}
    AWS.config.credentials = {accessKeyId: "foo", secretAccessKey: "bar"}
    console.log("AWS region, proxy and credentials are set.")
}

setupAWS(process.env.CONTAINER_URL)
