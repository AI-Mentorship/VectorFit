# Use AWS Lambda Python 3.12 base image
FROM public.ecr.aws/lambda/python:3.12
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
COPY models/ ${LAMBDA_TASK_ROOT}/models/
COPY processing.py ${LAMBDA_TASK_ROOT}/
COPY app.py ${LAMBDA_TASK_ROOT}/
RUN python -c "import torch; import torchvision; print('PyTorch pre-warmed')"
CMD ["app.lambdaHandler"]
