import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';

export const lambdaHandler = async (event) => {
  try {
    // Authenticate user
    const token = event.headers['x-auth-token'] || event.headers['X-Auth-Token'];
    if (!token) {
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
    } catch (err) {
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
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Email is required' }),
      };
    }

    // Get the current user
    const currentUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: decoded._id,
      },
    };
    const currentUserResult = await docClient.send(new GetCommand(currentUserParams));

    if (!currentUserResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const currentUser = currentUserResult.Item;
    const friendRequests = currentUser.friendRequests || [];

    // Find the friend request in friendRequests
    const requestIndex = friendRequests.findIndex(friend => friend.email === email);

    if (requestIndex === -1) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Friend request not found' }),
      };
    }

    // Remove from friendRequests
    const cancelledRequest = friendRequests[requestIndex];
    friendRequests.splice(requestIndex, 1);

    // Update current user
    const updateCurrentUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: currentUser.userId,
      },
      UpdateExpression: 'SET friendRequests = :friendRequests, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':friendRequests': friendRequests,
        ':updatedAt': new Date().toISOString(),
      },
    };
    await docClient.send(new UpdateCommand(updateCurrentUserParams));

    // Now remove from the target user's pendingFriends array
    const targetUserParams = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };
    const targetUserResult = await docClient.send(new QueryCommand(targetUserParams));

    if (targetUserResult.Items && targetUserResult.Items.length > 0) {
      const targetUser = targetUserResult.Items[0];
      const pendingFriends = targetUser.pendingFriends || [];

      // Find and remove current user from target user's pendingFriends
      const currentUserIndexInPending = pendingFriends.findIndex(
        friend => friend.email === currentUser.email
      );

      if (currentUserIndexInPending !== -1) {
        pendingFriends.splice(currentUserIndexInPending, 1);

        // Update target user
        const updateTargetUserParams = {
          TableName: USERS_TABLE,
          Key: {
            userId: targetUser.userId,
          },
          UpdateExpression: 'SET pendingFriends = :pendingFriends, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':pendingFriends': pendingFriends,
            ':updatedAt': new Date().toISOString(),
          },
        };
        await docClient.send(new UpdateCommand(updateTargetUserParams));
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
        message: 'Friend request cancelled successfully',
        cancelledRequest: cancelledRequest,
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
