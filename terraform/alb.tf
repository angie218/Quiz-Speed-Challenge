resource "aws_lb" "quiz_alb" {
  name               = "quiz-app-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [
    aws_security_group.web_server_lb.id,
    aws_security_group.internal.id
  ]

  subnets = module.vpc.public_subnets

  tags = merge(
    local.common_tags,
    {
      Name = "quiz-app-alb"
    }
  )
}


resource "aws_lb_target_group" "frontend" {
  name     = "quiz-frontend-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    enabled             = true
    path                = "/"
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200-399"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 6
    interval            = 10
  }

  tags = local.common_tags
}


resource "aws_lb_target_group" "backend" {
  name     = "quiz-backend-tg"
  port     = 3010
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    enabled             = true
    path                = "/api/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200-399"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 6
    interval            = 10
  }

  tags = local.common_tags
}


resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.quiz_alb.arn

  port     = 80
  protocol = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}


resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}