data "archive_file" "lambda_code" {
  output_path = "${local.appname}-backend.zip"
  source_dir = "${path.module}/../backend/build"
  type = "zip"
}

resource "aws_lambda_function" "validate_token" {
  function_name = "${local.appname}_validate_token"
  handler = "lambdaHandler.authorizeHandler"
  role = aws_iam_role.lambda_role.arn

  filename = data.archive_file.lambda_code.output_path
  source_code_hash = data.archive_file.lambda_code.output_base64sha256

  runtime = "nodejs12.x"

  timeout = 10

  environment {
    variables = {
      KMS_KEY_ALIAS = aws_kms_alias.password_encryption_key_alias.name
      JWT_KEY_ALIAS = aws_kms_alias.jwt_sign_and_verify_key_alias.name
      USERS_TABLE_NAME = aws_dynamodb_table.users_table.name
    }
  }
}

resource "aws_lambda_function" "get_token" {
  function_name = "${local.appname}_get_token"
  handler = "lambdaHandler.loginHandler"
  role = aws_iam_role.lambda_role.arn

  filename = data.archive_file.lambda_code.output_path
  source_code_hash = data.archive_file.lambda_code.output_base64sha256

  runtime = "nodejs12.x"

  timeout = 10

  environment {
    variables = {
      KMS_KEY_ALIAS = aws_kms_alias.password_encryption_key_alias.name
      JWT_KEY_ALIAS = aws_kms_alias.jwt_sign_and_verify_key_alias.name
      USERS_TABLE_NAME = aws_dynamodb_table.users_table.name
    }
  }
}
