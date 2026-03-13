resource "aws_db_subnet_group" "db_subnet_group" {
  name = "app-db-subnet-group"
  count = length(aws_subnet.private_subnet_1)

  subnet_ids = [aws_subnet.private_subnet_1[0].id, aws_subnet.private_subnet_1[1].id]
  

  tags = {
    Name = "app-db-subnet-group"
  }
}

resource "aws_security_group" "db_sg" {

  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.public_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "app_db" {
    count = length(aws_db_subnet_group.db_subnet_group)

  identifier = "react-app-db"

  engine         = "postgres"
  engine_version = "15"

  instance_class = "db.t3.micro"

  allocated_storage = 20

  db_name  = "appdb"
  username = "admin"
  password = "supersecurepassword"

  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group[count.index].name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  skip_final_snapshot = true
}

output "db_endpoint" {
  value = aws_db_instance.app_db[*].endpoint
}