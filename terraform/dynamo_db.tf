resource "aws_dynamodb_table" "users_table" {
  name = "${local.appname}_users"
  hash_key = "username"

  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "username"
    type = "S"
  }
}

data "aws_iam_policy_document" "users_rw_policy_document" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan"
    ]
    resources = [aws_dynamodb_table.users_table.arn]
  }
}

resource "aws_iam_policy" "users_rw_policy" {
  policy = data.aws_iam_policy_document.users_rw_policy_document.json
}
