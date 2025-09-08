/* resource "aws_iam_role" "iam_for_lambda" {
  name               = "ExecutionLambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "send-notifications-lambda" {
  function_name = "send-notifications-lambda"
  handler = "index.handler"
  filename = "${path.module}/../lambda/send-notifications-lambda.zip" 
  source_code_hash = filebase64sha256("${path.module}/../lambda/send-notifications-lambda.zip")
  role = aws_iam_role.iam_for_lambda.arn
  runtime = "nodejs20.x"
  timeout = 30
  memory_size = 256

  depends_on = [ aws_iam_role_policy_attachment.lambda_basic_execution ]
} */

resource "aws_sqs_queue" "notification_email_sqs" {
  name = "notification-email-sqs"
  delay_seconds = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600 
  visibility_timeout_seconds = 90
  receive_wait_time_seconds = 20

   redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_email_error_sqs.arn
    maxReceiveCount     = 3
  })


  tags = {
    name = "notification-email-sqs"
    environment = "production"
  }
  depends_on = [aws_sqs_queue.notification_email_error_sqs]
}

resource "aws_sqs_queue" "notification_email_error_sqs" {
  name = "notification-email-error-sqs"
  delay_seconds = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600 
  receive_wait_time_seconds = 20
  visibility_timeout_seconds = 300

  tags = {
    name = "notification-email-error-sqs"
    environment = "production"
  }
}

resource "aws_s3_bucket" "templates_email_notification" {
   bucket = "templates-email-notification-${random_string.bucket_suffix.result}"

  tags = {
    Name = "templates-email-notification"
    Environment = "production"
  }
}

resource "aws_s3_object" "welcome_template" {
  bucket = aws_s3_bucket.templates_email_notification.bucket
  key = "welcome.html"
  source = "${path.module}/../src/shared/templates/welcome.html"
}

resource "aws_s3_object" "user_login_template" {
  bucket = aws_s3_bucket.templates_email_notification.bucket
  key = "user-login.html"
  source = "${path.module}/../src/shared/templates/user-login.html"
}

resource "aws_s3_object" "user_update" {
  bucket = aws_s3_bucket.templates_email_notification.bucket
  key = "user-update.html"
  source = "${path.module}/../src/shared/templates/user-update.html"
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_versioning" "templates_email_notification_versioning" {
  bucket = aws_s3_bucket.templates_email_notification.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "templates_email_notification_encryption" {
  bucket = aws_s3_bucket.templates_email_notification.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "notification_table" {
  name           = "notification-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "uuid"
  range_key      = "createdAt"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  tags = {
    Name = "notification-table"
    Environment = "production"
  }
}

resource "aws_dynamodb_table" "notification_error_table" {
  name           = "notification-error-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "uuid"
  range_key      = "createdAt"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  tags = {
    Name = "notification-error-table"
    Environment = "production"
  }
}

resource "aws_lambda_function" "send_notifications_error_lambda" {
  function_name    = "send-notifications-error-lambda"
  handler          = "index.handler"
  filename         = "${path.module}/../lambda/send-notifications-error-lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda/send-notifications-error-lambda.zip")
  role            = aws_iam_role.iam_for_lambda_notifications.arn
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      NOTIFICATION_ERROR_TABLE = aws_dynamodb_table.notification_error_table.name
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_notifications_policy]
}

resource "aws_lambda_function" "send_notifications_lambda_updated" {
  function_name    = "send-notifications-lambda"
  handler          = "index.handler"
  filename         = "${path.module}/../lambda/send-notifications-lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda/send-notifications-lambda.zip")
  role            = aws_iam_role.iam_for_lambda_notifications.arn
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      REGION = var.aws_region
      NOTIFICATION_TABLE = aws_dynamodb_table.notification_table.name
      TEMPLATES_BUCKET = aws_s3_bucket.templates_email_notification.bucket
      SMTP_USER = var.smtp_user
      SMTP_PASS = var.smtp_pass
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_notifications_policy]
}

resource "aws_iam_role" "iam_for_lambda_notifications" {
  name               = "ExecutionLambdaNotifications"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_notifications_basic_execution" {
  role       = aws_iam_role.iam_for_lambda_notifications.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_notifications_policy" {
  name        = "LambdaNotificationsPolicy"
  description = "Policy for notification service lambdas"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:SendMessage"
        ]
        Resource = [
          aws_sqs_queue.notification_email_sqs.arn,
          aws_sqs_queue.notification_email_error_sqs.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.templates_email_notification.arn,
          "${aws_s3_bucket.templates_email_notification.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.notification_table.arn,
          aws_dynamodb_table.notification_error_table.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_notifications_policy" {
  role       = aws_iam_role.iam_for_lambda_notifications.name
  policy_arn = aws_iam_policy.lambda_notifications_policy.arn
}

resource "aws_lambda_event_source_mapping" "notification_sqs_lambda_trigger" {
  event_source_arn = aws_sqs_queue.notification_email_sqs.arn
  function_name    = aws_lambda_function.send_notifications_lambda_updated.arn
  batch_size       = 1
  enabled          = true
  maximum_batching_window_in_seconds = 0
  scaling_config {
    maximum_concurrency = 5
  }
}

resource "aws_iam_role_policy_attachment" "lambda_cloudwatch_logs" {
  role       = aws_iam_role.iam_for_lambda_notifications.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_cloudwatch_full_access" {
  role       = aws_iam_role.iam_for_lambda_notifications.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"  # Solo para debugging
}

resource "aws_lambda_event_source_mapping" "notification_error_sqs_lambda_trigger" {
  event_source_arn = aws_sqs_queue.notification_email_error_sqs.arn
  function_name    = aws_lambda_function.send_notifications_error_lambda.arn
  batch_size       = 10
  enabled          = true
}
