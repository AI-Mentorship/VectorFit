import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CLOTHE_ITEMS_TABLE = process.env.CLOTHE_ITEMS_TABLE;

export const lambdaHandler = async (event) => {
  console.log('Get Virtual Closet Action request received');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const actionGroup = event.actionGroup;
    const apiPath = event.apiPath;
    const httpMethod = event.httpMethod; // CRITICAL: Must echo this back
    const parameters = event.parameters || [];

    // Extract userId from session attributes
    const userIdParam = event.sessionAttributes?.userId;

    if (!userIdParam) {
      return {
        messageVersion: '1.0',
        response: {
          actionGroup,
          apiPath,
          httpMethod, // Echo back the httpMethod from input
          httpStatusCode: 400,
          responseBody: {
            'application/json': { // Use application/json for API Schema format
              body: JSON.stringify({
                error: 'userId not found in session attributes',
              }),
            },
          },
        },
      };
    }

    const userId = userIdParam;

    const params = {
      TableName: CLOTHE_ITEMS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await docClient.send(new QueryCommand(params));
    const closetItems = result.Items || [];

    // Format response for API Schema-based action groups
    return {
      messageVersion: '1.0',
      response: {
        actionGroup,
        apiPath,
        httpMethod, // CRITICAL: Echo back the httpMethod from input
        httpStatusCode: 200,
        responseBody: {
          'application/json': { // Use application/json for API Schema format
            body: JSON.stringify({
              success: true,
              closetItems: closetItems.map(item => ({
                id: item.clotheItemId,
                type: item.clothingType,
                color: item.dominantColor?.name || 'unknown',
                imageUrl: item.imageUrl,
              })),
              message: `Found ${closetItems.length} items in the user's virtual closet.`,
            }),
          },
        },
      },
      sessionAttributes: event.sessionAttributes || {},
      promptSessionAttributes: event.promptSessionAttributes || {},
    };
  } catch (error) {
    console.error('Error in Get Virtual Closet Action:', error);
    return {
      messageVersion: '1.0',
      response: {
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod, // Echo back the httpMethod
        httpStatusCode: 500,
        responseBody: {
          'application/json': { // Use application/json for API Schema format
            body: JSON.stringify({
              error: error.message,
            }),
          },
        },
      },
      sessionAttributes: event.sessionAttributes || {},
      promptSessionAttributes: event.promptSessionAttributes || {},
    };
  }
};

