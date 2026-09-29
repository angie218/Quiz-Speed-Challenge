data "aws_availability_zones" "available" {
  state = "available"
}


module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = local.vpc_name
  cidr = local.vpc_cidr

  azs = [
    data.aws_availability_zones.available.names[0],
    data.aws_availability_zones.available.names[1]
  ]

  public_subnets = local.public_subnets

  enable_dns_support   = true
  enable_dns_hostnames = true

  map_public_ip_on_launch = true

  tags = local.common_tags
}