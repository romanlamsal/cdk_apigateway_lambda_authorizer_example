resource "aws_iam_role" "lambda_role" {
  name = "${local.appname}_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_lambda_role_doc.json
}

resource "aws_iam_policy_attachment" "lambda_basic_execution_role_policy_attachment" {
  name = "${local.appname}_lambda_save_entity_to_dynamo"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  roles = [aws_iam_role.lambda_role.name]
}

resource "aws_iam_policy_attachment" "lambda_password_encrypt_attachment" {
  name = "kms_password_encrypt"
  policy_arn = aws_iam_policy.password_encrypt_policy.arn
  roles = [aws_iam_role.lambda_role.name]
}

resource "aws_iam_policy_attachment" "lambda_jwt_sign_and_verify_attachment" {
  name = "kms_password_encrypt"
  policy_arn = aws_iam_policy.jwt_sign_and_verify_policy.arn
  roles = [aws_iam_role.lambda_role.name]
}

resource "aws_iam_policy_attachment" "lambda_users_table_rw" {
  name = "users_table_rw"
  policy_arn = aws_iam_policy.users_rw_policy.arn
  roles = [aws_iam_role.lambda_role.name]
}

resource "aws_iam_role_policy" "lambda_put_metric_cloudwatch" {
  role = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.lambda_put_metric_cloudwatch_doc.json
}

data "aws_iam_policy_document" "lambda_put_metric_cloudwatch_doc" {
  statement {
    effect = "Allow"
    actions = [ "cloudwatch:PutMetricData" ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "assume_lambda_role_doc" {
  statement {
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type = "Service"
    }
    actions = ["sts:AssumeRole"]
  }
}
