terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

provider "random" {
  
}

resource "aws_vpc" "name" {
  cidr_block = var.cidr_block
}
