resource "aws_route53_zone" "public_hosted_zone" {
  name = local.base_url

  comment = "HostedZone created by Route53 Registrar"

  tags = {
    app = local.appname
  }
}

resource "aws_route53_record" "cloudfront_alias" {
  name = local.base_url
  type = "A"
  zone_id = aws_route53_zone.public_hosted_zone.id

  alias {
    evaluate_target_health = false
    name = "s3-website.eu-central-1.amazonaws.com"
    zone_id = aws_s3_bucket.redirect_gui_bucket.hosted_zone_id
  }
}

resource "aws_route53_record" "cloudfront_alias_www" {
  name = "www.${local.base_url}"
  type = "A"
  zone_id = aws_route53_zone.public_hosted_zone.id

  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.cloudfront_cdn.domain_name
    zone_id = aws_cloudfront_distribution.cloudfront_cdn.hosted_zone_id
  }
}

resource "aws_route53_record" "api_record" {
  name = aws_api_gateway_domain_name.api_domain_name.domain_name
  type = "A"
  zone_id = aws_route53_zone.public_hosted_zone.id

  alias {
    evaluate_target_health = false
    name = aws_api_gateway_domain_name.api_domain_name.regional_domain_name
    zone_id = aws_api_gateway_domain_name.api_domain_name.regional_zone_id
  }

}

resource "aws_route53_record" "nameservers" {
  name = local.base_url
  type = "NS"
  zone_id = aws_route53_zone.public_hosted_zone.id

  records = [
    "ns-1373.awsdns-43.org.",
    "ns-1676.awsdns-17.co.uk.",
    "ns-284.awsdns-35.com.",
    "ns-574.awsdns-07.net.",
  ] // TODO customize

  ttl = 172800
}

resource "aws_route53_record" "start_of_authority" {
  name = local.base_url
  type = "SOA"
  zone_id = aws_route53_zone.public_hosted_zone.id

  records = [
    "ns-574.awsdns-07.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400" // TODO customize
  ]

  ttl = 900
}

resource "aws_route53_record" "cert_validation" {
  name = aws_acm_certificate.cert.domain_validation_options.0.resource_record_name
  type = aws_acm_certificate.cert.domain_validation_options.0.resource_record_type
  zone_id = aws_route53_zone.public_hosted_zone.id
  records = [aws_acm_certificate.cert.domain_validation_options.0.resource_record_value]
  ttl = 60
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn = aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation.fqdn]

  provider = aws.us_east_1
}

resource "aws_acm_certificate" "cert" {
  domain_name       = local.base_url
  subject_alternative_names = ["*.${local.base_url}"]
  validation_method = "DNS"

  tags = {
    app = local.appname
  }

  lifecycle {
    create_before_destroy = true
  }

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  provider = aws.us_east_1
}

resource "aws_acm_certificate" "cert_regional" {
  domain_name       = local.base_url
  subject_alternative_names = ["*.${local.base_url}"]
  validation_method = "DNS"

  tags = {
    app = local.appname
  }

  lifecycle {
    create_before_destroy = true
  }

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  provider = aws // just to make it clear
}
