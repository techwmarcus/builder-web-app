data "aws_availability_zones" "available" {
  state = "available"  
}


variable "region" {
  type = string
  default = "us-west-1"
  }