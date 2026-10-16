variable key_name {
  description = "EC2 SSH key pair name"
  default = "RepoPilot"
  type = string
}

variable instance_type {
  default = "t3.small"
}
