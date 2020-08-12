locals {
  stage_name = "dev"
}

resource "aws_api_gateway_rest_api" "lambda_gateway" {
  name = "${local.appname}Api"

  endpoint_configuration {
    types = [
      "REGIONAL"]
  }
}

resource "aws_api_gateway_authorizer" "validate_jwt_token" {
  name = "jwtTokenAuthorizer"
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id

  type = "REQUEST"
  identity_source = "method.request.header.Cookie"

  authorizer_uri = aws_lambda_function.validate_token.invoke_arn

  authorizer_result_ttl_in_seconds = 0
}

resource "aws_lambda_permission" "api_gw" {
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.validate_token.function_name
  principal = "apigateway.amazonaws.com"
}

// /login
resource "aws_api_gateway_resource" "api_resource_login" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  parent_id = aws_api_gateway_rest_api.lambda_gateway.root_resource_id
  path_part = "login"
}

module "get_token" {
  source = "./lambdaApi"

  appname = local.appname
  base_url = local.base_url

  http_method = "POST"
  lambda_function = aws_lambda_function.get_token
  gateway_resource_id = aws_api_gateway_resource.api_resource_login.id
}

resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  stage_name = local.stage_name

  depends_on = [
    aws_api_gateway_rest_api.lambda_gateway,
    module.get_token,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_domain_name" "api_domain_name" {
  domain_name = "api.${local.base_url}"
  regional_certificate_arn = aws_acm_certificate.cert_regional.arn

  endpoint_configuration {
    types = [
      "REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "api_domain_name_mapping" {
  api_id = aws_api_gateway_rest_api.lambda_gateway.id
  domain_name = aws_api_gateway_domain_name.api_domain_name.domain_name
  stage_name = local.stage_name
}

output "base_url" {
  value = aws_api_gateway_deployment.api_deployment.invoke_url
}

// validate token
resource "aws_api_gateway_method" "validate_token" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = aws_api_gateway_resource.api_resource_login.id
  http_method = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.validate_jwt_token.id
}

resource "aws_api_gateway_integration" "validate_token" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = aws_api_gateway_resource.api_resource_login.id
  http_method = aws_api_gateway_method.validate_token.http_method
  type = "MOCK"

  request_templates = {
    "application/json" = jsonencode(
    {
      statusCode = 200
    }
    )
  }
}

resource "aws_api_gateway_integration_response" "validate_token" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = aws_api_gateway_resource.api_resource_login.id
  http_method = aws_api_gateway_method.validate_token.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://www.${local.base_url}'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Cookie,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Credentials" = "'true'"
  }

  depends_on = [
    aws_api_gateway_integration.validate_token]
}

resource "aws_api_gateway_method_response" "validate_token" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = aws_api_gateway_resource.api_resource_login.id
  http_method = aws_api_gateway_method.validate_token.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Credentials" = true,
  }

  depends_on = [
    aws_api_gateway_method.validate_token]
}
