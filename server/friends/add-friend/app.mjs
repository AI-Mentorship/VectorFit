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

    // Get the requesting user
    const requestingUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: decoded._id,
      },
    };
    const requestingUserResult = await docClient.send(new GetCommand(requestingUserParams));

    if (!requestingUserResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const requestingUser = requestingUserResult.Item;

    // Check if user is trying to add themselves
    if (requestingUser.email === email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Cannot send friend request to yourself' }),
      };
    }

    // Find the target user by email
    const targetUserParams = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };
    const targetUserResult = await docClient.send(new QueryCommand(targetUserParams));

    if (!targetUserResult.Items || targetUserResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User with that email not found' }),
      };
    }

    const targetUser = targetUserResult.Items[0];

    // Initialize friend arrays if they don't exist
    const requestingUserFriendRequests = requestingUser.friendRequests || [];
    const requestingUserAcceptedFriends = requestingUser.acceptedFriends || [];
    const requestingUserPendingFriends = requestingUser.pendingFriends || [];
    const targetUserPendingFriends = targetUser.pendingFriends || [];
    const targetUserAcceptedFriends = targetUser.acceptedFriends || [];
    const targetUserFriendRequests = targetUser.friendRequests || [];

    // Check if already friends
    if (requestingUserAcceptedFriends.some(friend => friend.email === email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Already friends with this user' }),
      };
    }

    // Check if friend request already sent
    if (requestingUserFriendRequests.some(friend => friend.email === email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Friend request already sent' }),
      };
    }

    // Check if there's already a pending request from the target user
    // If so, auto-accept and make both users friends
    const pendingRequestIndex = requestingUserPendingFriends.findIndex(friend => friend.email === email);
    if (pendingRequestIndex !== -1) {
      console.log('Auto-accepting friend request from:', email);

      // Remove from requesting user's pendingFriends and add to acceptedFriends
      const friendData = requestingUserPendingFriends[pendingRequestIndex];
      requestingUserPendingFriends.splice(pendingRequestIndex, 1);
      requestingUserAcceptedFriends.push(friendData);

      // Remove from target user's friendRequests and add to acceptedFriends
      const targetUserFriendRequestsIndex = targetUserFriendRequests.findIndex(
        friend => friend.email === requestingUser.email
      );
      if (targetUserFriendRequestsIndex !== -1) {
        targetUserFriendRequests.splice(targetUserFriendRequestsIndex, 1);
      }

      const requestingUserData = {
        email: requestingUser.email,
        userName: requestingUser.userName,
        firstName: requestingUser.firstName,
        lastName: requestingUser.lastName,
      };
      targetUserAcceptedFriends.push(requestingUserData);

      // Update both users
      const updateRequestingUserParams = {
        TableName: USERS_TABLE,
        Key: {
          userId: requestingUser.userId,
        },
        UpdateExpression: 'SET pendingFriends = :pendingFriends, acceptedFriends = :acceptedFriends, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':pendingFriends': requestingUserPendingFriends,
          ':acceptedFriends': requestingUserAcceptedFriends,
          ':updatedAt': new Date().toISOString(),
        },
      };
      await docClient.send(new UpdateCommand(updateRequestingUserParams));

      const updateTargetUserParams = {
        TableName: USERS_TABLE,
        Key: {
          userId: targetUser.userId,
        },
        UpdateExpression: 'SET friendRequests = :friendRequests, acceptedFriends = :acceptedFriends, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':friendRequests': targetUserFriendRequests,
          ':acceptedFriends': targetUserAcceptedFriends,
          ':updatedAt': new Date().toISOString(),
        },
      };
      await docClient.send(new UpdateCommand(updateTargetUserParams));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          message: 'Friend request automatically accepted! You are now friends.',
          autoAccepted: true,
          friend: friendData,
        }),
      };
    }

    // Create friend data objects
    const requestingUserData = {
      email: requestingUser.email,
      userName: requestingUser.userName,
      firstName: requestingUser.firstName,
      lastName: requestingUser.lastName,
    };

    const targetUserData = {
      email: targetUser.email,
      userName: targetUser.userName,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
    };

    // Add to requesting user's friendRequests array
    requestingUserFriendRequests.push(targetUserData);

    // Add to target user's pendingFriends array
    targetUserPendingFriends.push(requestingUserData);

    // Update requesting user
    const updateRequestingUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: requestingUser.userId,
      },
      UpdateExpression: 'SET friendRequests = :friendRequests, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':friendRequests': requestingUserFriendRequests,
        ':updatedAt': new Date().toISOString(),
      },
    };
    await docClient.send(new UpdateCommand(updateRequestingUserParams));

    // Update target user
    const updateTargetUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: targetUser.userId,
      },
      UpdateExpression: 'SET pendingFriends = :pendingFriends, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':pendingFriends': targetUserPendingFriends,
        ':updatedAt': new Date().toISOString(),
      },
    };
    await docClient.send(new UpdateCommand(updateTargetUserParams));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Friend request sent successfully',
        targetUser: targetUserData,
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
