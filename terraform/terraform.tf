terraform {
  backend "s3" {
    bucket = "romanlamsal-terraform"
    key    = "" // TODO customize
    region = "eu-central-1"
  }
  required_version = "0.12.24"
}

provider "aws" {
  region = "eu-central-1"
  version = "~> 2.55"
}

provider "aws" {
  alias = "us_east_1"
  region = "us-east-1"
  version = "~> 2.55"
}
