resource "aws_ecs_cluster" "app_cluster" {
  name = "app-cluster"

}
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_iam_user" "ecr_user" {
  name = "ecr-user"
}
resource "aws_iam_user_policy_attachment" "name" {
    user       = aws_iam_user.ecr_user.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}
resource "aws_ecs_task_definition" "app_task" {
  family                   = "app-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  cpu    = "256"
  memory = "512"

  container_definitions = jsonencode([
    {
      name  = "app-task"
      image = "291433605780.dkr.ecr.us-west-1.amazonaws.com/app-repo:v1.0"
      portMappings = [
        {
          containerPort = 80
          hostport      = 80
          protocol      = "tcp"
        }
      ]
    }
  ])
}
resource "aws_ecs_service" "app_service" {
  name = "app-tasks"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_subnet_1[0].id, aws_subnet.private_subnet_1[1].id]
    security_groups = [aws_security_group.private_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_lb_alb_tg.arn
    container_name   = "app-task"
    container_port   = 80
  }
}
resource "aws_lb" "app_alb" {
  name               = "app-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_subnet[0].id, aws_subnet.public_subnet[1].id]
  security_groups    = [aws_security_group.public_sg.id]
}
resource "aws_lb_listener" "front_endd" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_lb_alb_tg.arn
  }
}
resource "aws_lb_target_group" "app_lb_alb_tg" {
  name        = "app-lb-alb-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path = "/index.html"
    protocol = "HTTP"
    matcher = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}




