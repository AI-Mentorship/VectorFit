"""
AWS Lambda handler for ML clothing prediction
Wraps the Flask prediction logic to work with API Gateway
"""

import json
import base64
import os
import sys
from datetime import datetime
from uuid import uuid4
from decimal import Decimal

# AWS SDK imports
import boto3
from boto3.dynamodb.conditions import Key
import jwt

# Import the ML processing functions from cv-server
# We'll copy these files into the Lambda deployment package
from processing import load_model, process_image

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')

# Environment variables
USERS_TABLE = os.environ.get('USERS_TABLE')
CLOTHE_ITEMS_TABLE = os.environ.get('CLOTHE_ITEMS_TABLE')
IMAGES_BUCKET = os.environ.get('IMAGES_BUCKET')
JWT_SECRET = os.environ.get('JWT_SECRET', 'secretstring1234')

# Load model once during cold start (outside handler)
print("Cold start: Loading ML model...")
model_loaded = load_model()
if not model_loaded:
    print("ERROR: Model failed to load during initialization")

def lambdaHandler(event, context):
    """
    Lambda handler for ML prediction endpoint

    Expects API Gateway proxy integration with:
    - event['headers']['x-auth-token']: JWT token
    - event['body']: base64-encoded image or multipart form data
    - event['isBase64Encoded']: true if body is base64

    Returns API Gateway proxy response format
    """
    try:
        print(f"Received event: {json.dumps(event, default=str)}")

        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-auth-token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET'
                },
                'body': ''
            }

        # Handle GET request for health check / warm-up
        if event.get('httpMethod') == 'GET':
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'status': 'ready',
                    'model_loaded': model_loaded
                })
            }

        # Check if model loaded successfully
        if not model_loaded:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'ML model not loaded'
                })
            }

        # Extract and verify JWT token
        headers_dict = {}
        for key, value in (event.get('headers') or {}).items():
            headers_dict[key.lower()] = value

        token = headers_dict.get('x-auth-token')
        if not token:
            print('No token provided')
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'success': False, 'error': 'Access denied. No token provided'})
            }

        # Verify JWT token
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = decoded.get('_id')
            print(f'Token verified for user: {user_id}')
        except jwt.ExpiredSignatureError:
            print('Token expired')
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'success': False, 'error': 'Token expired'})
            }
        except jwt.InvalidTokenError as e:
            print(f'Invalid token: {e}')
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'success': False, 'error': 'Invalid token'})
            }

        # Validate user exists in DynamoDB
        users_table = dynamodb.Table(USERS_TABLE)
        try:
            user_response = users_table.get_item(Key={'userId': user_id})
            if 'Item' not in user_response:
                print(f'User not found: {user_id}')
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    'body': json.dumps({'success': False, 'error': 'User not found'})
                }
            print(f'User validated: {user_id}')
        except Exception as e:
            print(f'Error validating user: {e}')
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'success': False, 'error': 'Error validating user'})
            }

        # Extract image from request body
        image_bytes = None

        # Get headers (case-insensitive)
        headers = {}
        for key, value in (event.get('headers') or {}).items():
            headers[key.lower()] = value

        content_type = headers.get('content-type', '')
        
        print(f"Content-Type: {content_type}")
        print(f"isBase64Encoded: {event.get('isBase64Encoded')}")

        # Get body and decode if needed
        body = event.get('body', '')
        if event.get('isBase64Encoded') and body:
            print("Decoding base64 body...")
            body = base64.b64decode(body)
        elif isinstance(body, str):
            body = body.encode('utf-8')

        print(f"Body length: {len(body) if body else 0}")

        # Handle different input formats
        if 'multipart/form-data' in content_type.lower():
            print("Parsing multipart/form-data...")
            # Parse multipart - look for image file data
            if isinstance(body, bytes):
                # Find the boundary
                boundary_match = content_type.split('boundary=')
                if len(boundary_match) > 1:
                    boundary = boundary_match[1].strip()
                    # Split by boundary
                    parts = body.split(f'--{boundary}'.encode())
                    
                    for part in parts:
                        if b'Content-Disposition' in part and b'name="image"' in part:
                            # Found the image part
                            # Split headers from data
                            header_end = part.find(b'\r\n\r\n')
                            if header_end > 0:
                                image_data = part[header_end + 4:]
                                # Remove trailing boundary markers
                                if image_data.endswith(b'\r\n'):
                                    image_data = image_data[:-2]
                                image_bytes = image_data
                                print(f"Extracted image from multipart: {len(image_bytes)} bytes")
                                break

        elif 'application/json' in content_type.lower():
            print("Parsing JSON body...")
            # Expect JSON with base64-encoded image
            try:
                if isinstance(body, bytes):
                    body = body.decode('utf-8')
                body_json = json.loads(body)
                if 'image' in body_json:
                    image_bytes = base64.b64decode(body_json['image'])
                    print(f"Extracted image from JSON: {len(image_bytes)} bytes")
            except Exception as e:
                print(f"Error parsing JSON: {e}")

        if not image_bytes:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No image provided. Send as base64 in JSON {"image": "..."} or as multipart/form-data'
                })
            }

        print(f"\n{'='*60}")
        print("📸 IMAGE RECEIVED")
        print(f"{'='*60}")
        print(f"Image size: {len(image_bytes)} bytes")

        # Process image using the ML model
        result = process_image(image_bytes)

        if result['success']:
            print("\nPREDICTION SUCCESS")
            print("-" * 60)
            print(f"Clothing Type: {result['clothing_type']}")
            print(f"Confidence: {result['confidence']:.2f}%")

            if result.get('dominant_color'):
                print(f"\n🎨 Dominant Color: {result['dominant_color']['name']}")
                print(f"   RGB: {result['dominant_color']['rgb']}")
            else:
                print("\n🎨 Dominant Color: Not available")

            print("\nFull JSON Response:")
            print(json.dumps(result, indent=2))
            print("=" * 60 + "\n")

            # Store image in S3
            clothe_item_id = str(uuid4())
            image_key = f"users/{user_id}/clothes/{clothe_item_id}.jpg"

            try:
                print(f"Attempting to store image in S3...")
                print(f"Bucket: {IMAGES_BUCKET}")
                print(f"Key: {image_key}")
                print(f"Image size: {len(image_bytes)} bytes")

                s3_client.put_object(
                    Bucket=IMAGES_BUCKET,
                    Key=image_key,
                    Body=image_bytes,
                    ContentType='image/jpeg'
                )
                print(f"✓ Image stored in S3: {image_key}")
            except Exception as e:
                print(f"✗ Error storing image in S3: {str(e)}")
                import traceback
                traceback.print_exc()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': f'Failed to store image: {str(e)}'
                    })
                }

            # Store prediction results in DynamoDB
            clothe_items_table = dynamodb.Table(CLOTHE_ITEMS_TABLE)
            timestamp = datetime.utcnow().isoformat()

            # Convert float to Decimal for DynamoDB compatibility
            # Also convert RGB values in dominantColor if present
            dominant_color = result.get('dominant_color')
            if dominant_color and 'rgb' in dominant_color:
                dominant_color = {
                    'name': dominant_color['name'],
                    'rgb': [int(val) for val in dominant_color['rgb']]  # Convert to int list
                }

            clothe_item = {
                'clotheItemId': clothe_item_id,
                'userId': user_id,
                'clothingType': result['clothing_type'],
                'confidence': Decimal(str(result['confidence'])),  # Convert float to Decimal
                'dominantColor': dominant_color,
                'imageKey': image_key,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }

            try:
                print(f"Attempting to store clothe item in DynamoDB...")
                print(f"Table: {CLOTHE_ITEMS_TABLE}")
                print(f"Item: {json.dumps(clothe_item, default=str)}")

                clothe_items_table.put_item(Item=clothe_item)
                print(f"✓ Clothe item stored in DynamoDB: {clothe_item_id}")
            except Exception as e:
                print(f"✗ Error storing clothe item in DynamoDB: {str(e)}")
                import traceback
                traceback.print_exc()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': f'Failed to store clothe item: {str(e)}'
                    })
                }

            # Return success with clothe item ID
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'clotheItemId': clothe_item_id,
                    'clothingType': result['clothing_type'],
                    'confidence': result['confidence'],
                    'dominantColor': result.get('dominant_color'),
                    'message': 'Clothing item saved successfully'
                })
            }
        else:
            print(f"\nPREDICTION FAILED: {result.get('error', 'Unknown error')}\n")

            # Return error response
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }

    except Exception as e:
        print(f"\nERROR processing request: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }