import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';

export const lambdaHandler = async (event) => {
  try {
    // Verify token
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

    // Parse request body
    const body = JSON.parse(event.body);
    const { topId, bottomId } = body;

    if (!topId || !bottomId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Both topId and bottomId are required' }),
      };
    }

    // Get current user data to retrieve existing history
    const getUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: decoded._id,
      },
    };

    const userResult = await docClient.send(new GetCommand(getUserParams));

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    // Create new outfit set
    const newOutfit = {
      topId,
      bottomId,
      timestamp: new Date().toISOString(),
    };

    // Get existing history and add new outfit to the beginning
    const existingHistory = userResult.Item.outfitHistory || [];
    const updatedHistory = [newOutfit, ...existingHistory];

    // Update user with new active outfit and add to history
    const updateParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: decoded._id,
      },
      UpdateExpression: 'SET activeOutfit = :activeOutfit, outfitHistory = :outfitHistory, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':activeOutfit': {
          topId,
          bottomId,
        },
        ':outfitHistory': updatedHistory,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };

    const result = await docClient.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Outfit saved successfully',
        activeOutfit: result.Attributes.activeOutfit,
        outfitHistory: result.Attributes.outfitHistory,
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