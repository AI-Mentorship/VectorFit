import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

/**
 * Lambda handler for WebSocket $connect route
 */
export const lambdaHandler = async (event) => {
  console.log('WebSocket Connect:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  try {
    // Store connection in DynamoDB
    await docClient.send(new PutCommand({
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId: connectionId,
        connectedAt: new Date().toISOString()
      }
    }));

    console.log(`Connection ${connectionId} stored successfully`);

    return {
      statusCode: 200,
      body: 'Connected'
    };
  } catch (error) {
    console.error('Error storing connection:', error);
    return {
      statusCode: 500,
      body: 'Failed to connect'
    };
  }
};