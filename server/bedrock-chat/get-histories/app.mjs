import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CHAT_HISTORIES_TABLE = process.env.CHAT_HISTORIES_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';

export const lambdaHandler = async (event) => {
  console.log('Get Chat Histories request:', JSON.stringify(event, null, 2));

  try {
    // Extract and verify JWT token
    const token = event.headers['x-auth-token'] || event.headers['X-Auth-Token'];
    if (!token) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const userId = decoded._id;

    // Query chat histories for this user, sorted by most recent
    const result = await docClient.send(new QueryCommand({
      TableName: CHAT_HISTORIES_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort by newest first
    }));

    const chatHistories = result.Items || [];

    // Sort by updatedAt descending to get most recent conversations first
    chatHistories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        chatHistories: chatHistories
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
