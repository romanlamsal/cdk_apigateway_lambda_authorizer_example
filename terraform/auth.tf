data "aws_caller_identity" "current" {
}

data "aws_iam_policy_document" "password_encryption_key_policy_doc" {
  statement {
    principals {
      identifiers = [data.aws_caller_identity.current.account_id, data.aws_caller_identity.current.arn]
      type = "AWS"
    }
    actions = ["*"]
    resources = ["*"]
  }
  statement {
    principals {
      identifiers = [aws_iam_role.lambda_role.arn]
      type = "AWS"
    }
    actions = ["kms:Encrypt", "kms:Decrypt"]
    resources = ["*"]
  }
}

resource "aws_kms_key" "password_encryption_key" {
  key_usage = "ENCRYPT_DECRYPT"

  policy = data.aws_iam_policy_document.password_encryption_key_policy_doc.json
}

resource "aws_kms_alias" "password_encryption_key_alias" {
  target_key_id = aws_kms_key.password_encryption_key.id
  name = "alias/password_encryption_key"
}

data "aws_iam_policy_document" "password_encrypt_policy_doc" {
  statement {
    actions = ["kms:Encrypt", "kms:Decrypt"]
    resources = [aws_kms_key.password_encryption_key.arn]
  }
}

resource "aws_iam_policy" "password_encrypt_policy" {
  policy = data.aws_iam_policy_document.password_encrypt_policy_doc.json
}

data "aws_iam_policy_document" "jwt_sign_and_verify_key_policy_doc" {
  statement {
    principals {
      identifiers = [data.aws_caller_identity.current.account_id, data.aws_caller_identity.current.arn]
      type = "AWS"
    }
    actions = ["*"]
    resources = ["*"]
  }
  statement {
    principals {
      identifiers = [aws_iam_role.lambda_role.arn]
      type = "AWS"
    }
    actions = ["kms:Sign", "kms:Verify"]
    resources = ["*"]
  }
}

resource "aws_kms_key" "jwt_sign_and_verify_key" {
  key_usage = "SIGN_VERIFY"
  customer_master_key_spec = "RSA_4096"

  policy = data.aws_iam_policy_document.jwt_sign_and_verify_key_policy_doc.json
}

resource "aws_kms_alias" "jwt_sign_and_verify_key_alias" {
  target_key_id = aws_kms_key.jwt_sign_and_verify_key.id
  name = "alias/jwt_sign_and_verify_key"
}

data "aws_iam_policy_document" "jwt_sign_and_verify_policy_doc" {
  statement {
    actions = ["kms:Sign", "kms:Verify"]
    resources = [aws_kms_key.jwt_sign_and_verify_key.arn]
  }
}

resource "aws_iam_policy" "jwt_sign_and_verify_policy" {
  policy = data.aws_iam_policy_document.jwt_sign_and_verify_policy_doc.json
}
