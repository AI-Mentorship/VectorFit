import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client({});

const USERS_TABLE = process.env.USERS_TABLE;
const CLOTHE_ITEMS_TABLE = process.env.CLOTHE_ITEMS_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';

export const lambdaHandler = async (event) => {
  console.log('GetAllClothes request received');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract and verify JWT token
    const token = event.headers['x-auth-token'] || event.headers['X-Auth-Token'];
    if (!token) {
      console.log('No token provided');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Access denied. No token provided' }),
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified:', decoded);
    } catch (err) {
      console.log('Invalid token');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Invalid token' }),
      };
    }

    const userId = decoded._id;

    // Validate user exists
    const getUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: userId,
      },
    };

    const userResult = await docClient.send(new GetCommand(getUserParams));

    if (!userResult.Item) {
      console.log('User not found');
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    // Query all clothing items for this user
    const queryParams = {
      TableName: CLOTHE_ITEMS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const clothesResult = await docClient.send(new QueryCommand(queryParams));

    if (!clothesResult.Items || clothesResult.Items.length === 0) {
      console.log('No clothes found for user');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          clothes: [],
          count: 0,
        }),
      };
    }

    // Generate presigned URLs for all images
    const clothesWithUrls = await Promise.all(
      clothesResult.Items.map(async (item) => {
        if (item.imageKey) {
          try {
            const command = new GetObjectCommand({
              Bucket: IMAGES_BUCKET,
              Key: item.imageKey,
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
            return {
              ...item,
              imageUrl: signedUrl,
            };
          } catch (error) {
            console.error(`Error generating presigned URL for ${item.imageKey}:`, error);
            return item;
          }
        }
        return item;
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        clothes: clothesWithUrls,
        count: clothesWithUrls.length,
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

