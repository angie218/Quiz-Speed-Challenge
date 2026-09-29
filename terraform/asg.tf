resource "aws_autoscaling_group" "quiz_app" {
  name = "quiz-app-asg"

  min_size         = 2
  desired_capacity = 2
  max_size         = 2

  vpc_zone_identifier = module.vpc.public_subnets

  launch_template {
    id      = aws_launch_template.quiz_app.id
    version = "$Latest"
  }

  target_group_arns = [
    aws_lb_target_group.frontend.arn,
    aws_lb_target_group.backend.arn
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 180

  force_delete = true

  tag {
    key                 = "Name"
    value               = "quiz-app-asg-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = "Quiz Speed Challenge"
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "Terraform"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}