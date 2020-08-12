resource "aws_api_gateway_resource" "rest_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  parent_id = aws_api_gateway_rest_api.lambda_gateway.root_resource_id
  path_part = "{proxy+}"
}

locals {
  //resource_id = aws_api_gateway_rest_api.lambda_gateway.root_resource_id
  resource_id = aws_api_gateway_resource.rest_api_resource.id
}

resource "aws_api_gateway_method" "opt" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = local.resource_id
  http_method = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "opt" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = local.resource_id
  http_method = aws_api_gateway_method.opt.http_method
  type = "MOCK"

  request_templates = {
    "application/json" = jsonencode(
    {
      statusCode = 200
    }
    )
  }
}

resource "aws_api_gateway_integration_response" "opt" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = local.resource_id
  http_method = aws_api_gateway_method.opt.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://www.${local.base_url}'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Cookie,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Credentials" = "'true'"
  }

  depends_on = [
    aws_api_gateway_integration.opt]
}

resource "aws_api_gateway_method_response" "opt" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = local.resource_id
  http_method = aws_api_gateway_method.opt.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Credentials" = true,
  }

  depends_on = [
    aws_api_gateway_method.opt]
}
