import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client({});

const CLOTHE_ITEMS_TABLE = process.env.CLOTHE_ITEMS_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;

export const lambdaHandler = async (event) => {
  console.log('GetClotheById request received');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract clothe item ID from path parameters
    const clotheItemId = event.pathParameters?.id;

    if (!clotheItemId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Clothe item ID is required' }),
      };
    }

    // Get the clothe item from DynamoDB
    const getParams = {
      TableName: CLOTHE_ITEMS_TABLE,
      Key: {
        clotheItemId: clotheItemId,
      },
    };

    const result = await docClient.send(new GetCommand(getParams));

    if (!result.Item) {
      console.log('Clothe item not found');
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Clothe item not found' }),
      };
    }

    const clotheItem = result.Item;

    // Generate presigned URL for the image if it exists
    if (clotheItem.imageKey) {
      try {
        const command = new GetObjectCommand({
          Bucket: IMAGES_BUCKET,
          Key: clotheItem.imageKey,
        });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
        clotheItem.imageUrl = signedUrl;
      } catch (error) {
        console.error(`Error generating presigned URL for ${clotheItem.imageKey}:`, error);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        clotheItem: clotheItem,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: error.message }),
    };
  }
};

