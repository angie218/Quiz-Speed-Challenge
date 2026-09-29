locals {
  project_name = "quiz-cloud-project"

  ami_id        = "ami-017b7cc27cb1ab9c2"
  instance_type = "t3.micro"

  vpc_name = "quiz-app-vpc"
  vpc_cidr = "10.10.0.0/16"

  public_subnets = [
    "10.10.1.0/24",
    "10.10.2.0/24"
  ]

  common_tags = {
    Project   = "Quiz Speed Challenge"
    ManagedBy = "Terraform"
  }
}