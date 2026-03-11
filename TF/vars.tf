data "aws_availability_zones" "available" {
  state = "available"  
}


variable "region" {
  type = string
  default = "us-west-1"
  }
variable "ami_id" {
  type = string
  default = "ami-0290e60ec230db1e4"
  
}
variable "subnets" {
  type = list(string)
  default = ["lb-subnet", "jumpbox-subnet"]
}