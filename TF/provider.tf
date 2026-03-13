terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.35.1"
    }
  }
  backend "s3" {
    bucket = "amarric-tf-state-test"
    key = "builder-state"
    region = "us-west-1"
    
  }
}

provider "aws" {
  region = "us-west-1"
}