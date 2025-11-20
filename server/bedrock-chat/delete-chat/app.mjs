import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand, QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CHAT_HISTORIES_TABLE = process.env.CHAT_HISTORIES_TABLE;
const CHAT_MESSAGES_TABLE = process.env.CHAT_MESSAGES_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';

export const lambdaHandler = async (event) => {
  console.log('Delete Chat request:', JSON.stringify(event, null, 2));

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
    const chatId = event.pathParameters?.chatId;

    if (!chatId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'chatId is required' })
      };
    }

    // Verify user owns this chat before deleting
    const chatResult = await docClient.send(new QueryCommand({
      TableName: CHAT_HISTORIES_TABLE,
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': chatId
      },
      Limit: 1
    }));

    const chat = chatResult.Items?.[0];
    if (!chat) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Chat not found' })
      };
    }

    if (chat.userId !== userId) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Delete all messages for this chat
    const messagesResult = await docClient.send(new QueryCommand({
      TableName: CHAT_MESSAGES_TABLE,
      IndexName: 'ChatIdIndex',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': chatId
      }
    }));

    const messages = messagesResult.Items || [];

    // Batch delete messages (max 25 at a time)
    if (messages.length > 0) {
      const deleteRequests = messages.map(msg => ({
        DeleteRequest: {
          Key: {
            messageId: msg.messageId
          }
        }
      }));

      // Split into batches of 25
      for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [CHAT_MESSAGES_TABLE]: batch
          }
        }));
      }
    }

    // Delete chat history
    await docClient.send(new DeleteCommand({
      TableName: CHAT_HISTORIES_TABLE,
      Key: {
        chatId: chatId
      }
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Chat deleted successfully'
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
