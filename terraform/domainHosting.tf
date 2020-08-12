resource "aws_s3_bucket" "gui_bucket" {
  bucket = "www.${local.base_url}"

  acl = "public-read"

  tags = {
    app = local.appname
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket" "redirect_gui_bucket" {
  bucket = local.base_url

  acl = "public-read"

  tags = {
    app = local.appname
  }

  website {
    redirect_all_requests_to = aws_s3_bucket.gui_bucket.bucket
  }
}

resource "aws_cloudfront_origin_access_identity" "cloudfront_cdn_access_identity" {
  comment = "${local.appname} access identity for cloudfront"
}

locals {
  cloudfront_origin_id = aws_s3_bucket.gui_bucket.bucket_domain_name
}

resource "aws_cloudfront_distribution" "cloudfront_cdn" {
  comment = "${local.appname}CDN"

  origin {
    domain_name = aws_s3_bucket.gui_bucket.bucket_domain_name
    origin_id = local.cloudfront_origin_id
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cloudfront_cdn_access_identity.cloudfront_access_identity_path
    }
  }

  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS"]
    cached_methods = [
      "GET",
      "HEAD"]
    target_origin_id = local.cloudfront_origin_id
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations = [
        "DE"]
    }
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method = "sni-only"
  }

  aliases = [
    local.base_url,
    "www.${local.base_url}"]

  enabled = true
  is_ipv6_enabled = true

  tags = {
    app = local.appname
  }

  custom_error_response {
    error_code = 404
    error_caching_min_ttl = 0
    response_page_path = "/index.html"
    response_code = 200
  }

  provider = aws.us_east_1

  depends_on = [
    aws_acm_certificate.cert,
    aws_acm_certificate_validation.cert_validation
  ]
}
