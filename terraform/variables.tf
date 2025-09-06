variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-2"
 }

 variable "aws_access_key" {
  description = "The AWS access key"
  type        = string
  sensitive   = true
 }

 variable "aws_secret_key" {
  description = "The AWS secret key"
  type        = string
  sensitive   = true
 }

 variable "cidr_block" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
   
 }