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
    const pendingFriends = currentUser.pendingFriends || [];

    // Find the friend request in pendingFriends
    const friendIndex = pendingFriends.findIndex(friend => friend.email === email);

    if (friendIndex === -1) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Friend request not found in pending friends' }),
      };
    }

    // Remove from pendingFriends
    const rejectedFriend = pendingFriends[friendIndex];
    pendingFriends.splice(friendIndex, 1);

    // Update current user
    const updateCurrentUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: currentUser.userId,
      },
      UpdateExpression: 'SET pendingFriends = :pendingFriends, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':pendingFriends': pendingFriends,
        ':updatedAt': new Date().toISOString(),
      },
    };
    await docClient.send(new UpdateCommand(updateCurrentUserParams));

    // Now remove from the friend's friendRequests array
    const friendUserParams = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };
    const friendUserResult = await docClient.send(new QueryCommand(friendUserParams));

    if (friendUserResult.Items && friendUserResult.Items.length > 0) {
      const friendUser = friendUserResult.Items[0];
      const friendRequests = friendUser.friendRequests || [];

      // Find and remove current user from friend's friendRequests
      const currentUserIndexInRequests = friendRequests.findIndex(
        friend => friend.email === currentUser.email
      );

      if (currentUserIndexInRequests !== -1) {
        friendRequests.splice(currentUserIndexInRequests, 1);

        // Update friend user
        const updateFriendUserParams = {
          TableName: USERS_TABLE,
          Key: {
            userId: friendUser.userId,
          },
          UpdateExpression: 'SET friendRequests = :friendRequests, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':friendRequests': friendRequests,
            ':updatedAt': new Date().toISOString(),
          },
        };
        await docClient.send(new UpdateCommand(updateFriendUserParams));
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
        message: 'Friend request rejected successfully',
        rejectedUser: rejectedFriend,
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
