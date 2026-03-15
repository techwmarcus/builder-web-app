
############################
# VPC
############################

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "main-vpc"
  }
}

############################
# Internet Gateway
############################

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}
resource "aws_eip" "nat_eip" {
  domain = "vpc"
  tags = {
    Name = "nat-eip"
  }
}
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet[0].id


  tags = {
    Name = "nat-gateway"
  }
  depends_on = [ aws_internet_gateway.igw ]
}

############################
# Public Subnet (Load Balancer)
############################

resource "aws_subnet" "public_subnet" {
    count = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 4}.0/24" 
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-lb${terraform.workspace}"
  }
}
resource "aws_security_group" "public_sg" {
vpc_id = aws_vpc.main.id
name = "public-sg"
description = "Allow inbound HTTP and SSH traffic"

ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
}
egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
}
tags = {
    Name = "public-sg${terraform.workspace}"
}
}

resource "aws_security_group" "private_sg" {
  vpc_id = aws_vpc.main.id
  name = "private-sg"
  description = "Allow inbound traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    security_groups = [aws_security_group.public_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "private-sg${terraform.workspace}"
  }
}

############################
# Private Subnets
############################

resource "aws_subnet" "private_subnet_1" {
    count = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 2}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-subnet-1${terraform.workspace}"
  }
}


############################
# Public Route Table
############################

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public-route-table${terraform.workspace}"
  }
}
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "private-route-table${terraform.workspace}"
  }
}

############################
# Associate Public Subnet
############################

resource "aws_route_table_association" "public_assoc" {
    count = 2
  subnet_id      = aws_subnet.public_subnet[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

############################
# Associate Private Subnets
############################

resource "aws_route_table_association" "private_assoc_1" {
    count = 2
  subnet_id      = aws_subnet.private_subnet_1[count.index].id
  route_table_id = aws_route_table.private_rt.id
}
