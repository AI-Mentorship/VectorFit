import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
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

    // Get the current user (accepter)
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

    // Initialize arrays if they don't exist
    const pendingFriends = currentUser.pendingFriends || [];
    const acceptedFriends = currentUser.acceptedFriends || [];

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

    // Get the friend data
    const friendData = pendingFriends[friendIndex];

    // Check if already in accepted friends (shouldn't happen, but just in case)
    if (acceptedFriends.some(friend => friend.email === email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Already friends with this user' }),
      };
    }

    // Remove from pendingFriends and add to acceptedFriends
    pendingFriends.splice(friendIndex, 1);
    acceptedFriends.push(friendData);

    // Update current user
    const updateCurrentUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: currentUser.userId,
      },
      UpdateExpression: 'SET pendingFriends = :pendingFriends, acceptedFriends = :acceptedFriends, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':pendingFriends': pendingFriends,
        ':acceptedFriends': acceptedFriends,
        ':updatedAt': new Date().toISOString(),
      },
    };
    await docClient.send(new UpdateCommand(updateCurrentUserParams));

    // Now update the friend's arrays (move from friendRequests to acceptedFriends)
    // We need to query the friend by email to get their userId
    const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
    const friendUserParams = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };
    const friendUserResult = await docClient.send(new QueryCommand(friendUserParams));

    if (!friendUserResult.Items || friendUserResult.Items.length === 0) {
      // This shouldn't happen, but if it does, we've already updated current user
      console.error('Friend user not found by email:', email);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          message: 'Friend request accepted (partial - could not update friend)',
        }),
      };
    }

    const friendUser = friendUserResult.Items[0];
    const friendRequests = friendUser.friendRequests || [];
    const friendAcceptedFriends = friendUser.acceptedFriends || [];

    // Find current user in friend's friendRequests
    const currentUserIndexInRequests = friendRequests.findIndex(
      friend => friend.email === currentUser.email
    );

    if (currentUserIndexInRequests !== -1) {
      // Remove from friendRequests
      const currentUserData = friendRequests[currentUserIndexInRequests];
      friendRequests.splice(currentUserIndexInRequests, 1);

      // Add to acceptedFriends
      const currentUserDataForFriend = {
        email: currentUser.email,
        userName: currentUser.userName,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      };
      friendAcceptedFriends.push(currentUserDataForFriend);

      // Update friend user
      const updateFriendUserParams = {
        TableName: USERS_TABLE,
        Key: {
          userId: friendUser.userId,
        },
        UpdateExpression: 'SET friendRequests = :friendRequests, acceptedFriends = :acceptedFriends, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':friendRequests': friendRequests,
          ':acceptedFriends': friendAcceptedFriends,
          ':updatedAt': new Date().toISOString(),
        },
      };
      await docClient.send(new UpdateCommand(updateFriendUserParams));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Friend request accepted successfully',
        friend: friendData,
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
