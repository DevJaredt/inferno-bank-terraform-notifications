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

 variable "notification_queue_name" {
  description = "Name of the main notification SQS queue"
  type        = string
  default     = "notification-email-sqs"
}

variable "notification_error_queue_name" {
  description = "Name of the notification error SQS queue (DLQ)"
  type        = string
  default     = "notification-email-error-sqs"
}

variable "templates_bucket_prefix" {
  description = "Prefix for the email templates S3 bucket"
  type        = string
  default     = "templates-email-notification"
}

variable "notification_table_name" {
  description = "Name of the notification DynamoDB table"
  type        = string
  default     = "notification-table"
}

variable "notification_error_table_name" {
  description = "Name of the notification error DynamoDB table"
  type        = string
  default     = "notification-error-table"
}