variable "appname" {
  type = string
}
variable "base_url" {
  type = string
}

variable "lambda_function" {
}

variable "http_method" {
  type = string
}

variable "gateway_resource_id" {
}

variable "authorizer_id" {
  default = ""
}


data "aws_api_gateway_rest_api" "rest_api" {
  name = "${var.appname}-Api"
}

resource "aws_api_gateway_method" "api_method" {
  count = length(var.authorizer_id) == 0 ? 1 : 0

  http_method = var.http_method
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  resource_id = var.gateway_resource_id

  request_parameters = {
    "method.request.header.Cookie" = true
  }

  authorization = "NONE"
}

resource "aws_api_gateway_method" "api_method_authorized" {
  count = length(var.authorizer_id) == 0 ? 0 : 1

  http_method = var.http_method
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  resource_id = var.gateway_resource_id

  request_parameters = {
    "method.request.header.Cookie" = true
  }

  authorization = "CUSTOM"
  authorizer_id = var.authorizer_id
}

resource "aws_api_gateway_integration" "api_lambda_integration" {
  count = length(var.authorizer_id) == 0 ? 1 : 0

  http_method = aws_api_gateway_method.api_method[0].http_method
  resource_id = aws_api_gateway_method.api_method[0].resource_id
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id

  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = var.lambda_function.invoke_arn

  request_parameters = {
    "integration.request.header.Cookie": "method.request.header.Cookie"
  }
}

resource "aws_api_gateway_integration" "api_lambda_integration_authorized" {
  count = length(var.authorizer_id) == 0 ? 0 : 1

  http_method = aws_api_gateway_method.api_method_authorized[0].http_method
  resource_id = aws_api_gateway_method.api_method_authorized[0].resource_id
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id

  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = var.lambda_function.invoke_arn

  request_parameters = {
    "integration.request.header.Cookie": "method.request.header.Cookie"
  }
}

resource "aws_lambda_permission" "api_gw" {
  action = "lambda:InvokeFunction"
  function_name = var.lambda_function.function_name
  principal = "apigateway.amazonaws.com"
}

// CORS stuff
resource "aws_api_gateway_method_response" "app_cors_method_response_200" {
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  resource_id = var.gateway_resource_id
  http_method = var.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Credentials" = true,
  }

  depends_on = [
    aws_api_gateway_method.api_method,
    aws_api_gateway_method.api_method_authorized,
  ]
}

resource "aws_api_gateway_integration_response" "app_api_gateway_integration_response" {
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  resource_id = var.gateway_resource_id
  http_method = var.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://www.${var.base_url}'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Cookie,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Credentials" = "'true'",
  }

  depends_on = [
    aws_api_gateway_method.api_method,
    aws_api_gateway_method.api_method_authorized,
    aws_api_gateway_integration.api_lambda_integration,
    aws_api_gateway_integration.api_lambda_integration_authorized,
  ]
}
