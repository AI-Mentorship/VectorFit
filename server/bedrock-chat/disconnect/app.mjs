import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

/**
 * Lambda handler for WebSocket $disconnect route
 */
export const lambdaHandler = async (event) => {
  console.log('WebSocket Disconnect:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  try {
    // Remove connection from DynamoDB
    await docClient.send(new DeleteCommand({
      TableName: CONNECTIONS_TABLE,
      Key: {
        connectionId: connectionId
      }
    }));

    console.log(`Connection ${connectionId} removed successfully`);

    return {
      statusCode: 200,
      body: 'Disconnected'
    };
  } catch (error) {
    console.error('Error removing connection:', error);
    return {
      statusCode: 500,
      body: 'Failed to disconnect'
    };
  }
};