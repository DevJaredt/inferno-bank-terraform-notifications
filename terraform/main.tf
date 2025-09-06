resource "aws_iam_role" "iam_for_lambda" {
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
}