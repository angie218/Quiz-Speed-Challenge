resource "aws_launch_template" "quiz_app" {
  name_prefix   = "quiz-app-"
  image_id      = local.ami_id
  instance_type = local.instance_type

  vpc_security_group_ids = [
    aws_security_group.internal.id,
    aws_security_group.web_servers.id
  ]

  update_default_version = true

  tag_specifications {
    resource_type = "instance"

    tags = merge(
      local.common_tags,
      {
        Name = "quiz-app-asg-instance"
      }
    )
  }

  tag_specifications {
    resource_type = "volume"

    tags = merge(
      local.common_tags,
      {
        Name = "quiz-app-asg-volume"
      }
    )
  }

  tags = merge(
    local.common_tags,
    {
      Name = "quiz-app-launch-template"
    }
  )
}