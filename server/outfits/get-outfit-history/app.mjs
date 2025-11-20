import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
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

    // Get user data
    const getParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: decoded._id,
      },
    };

    const result = await docClient.send(new GetCommand(getParams));

    if (!result.Item) {
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

    const outfitHistory = result.Item.outfitHistory || [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        outfitHistory,
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