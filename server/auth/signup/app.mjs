import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';

export const lambdaHandler = async (event) => {
  console.log('Signup request received');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { userName, firstName, lastName, email, password } = body;
    if (!userName || !firstName || !lastName || !email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'All fields are required' }),
      };
    }

    // Check if email already exists
    const emailCheckParams = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };

    const emailResult = await docClient.send(new QueryCommand(emailCheckParams));
    if (emailResult.Items && emailResult.Items.length > 0) {
      console.log('Email already exists');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Email already taken' }),
      };
    }
    const userNameCheckParams = {
      TableName: USERS_TABLE,
      IndexName: 'UserNameIndex',
      KeyConditionExpression: 'userName = :userName',
      ExpressionAttributeValues: {
        ':userName': userName,
      },
    };

    const userNameResult = await docClient.send(new QueryCommand(userNameCheckParams));

    if (userNameResult.Items && userNameResult.Items.length > 0) {
      console.log('Username already exists');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Username already taken' }),
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = randomUUID();
    const newUser = {
      userId,
      userName,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      activeOutfit: {
        topId: null,
        bottomId: null,
      },
      outfitHistory: [],
      acceptedFriends: [],
      pendingFriends: [],
      friendRequests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: USERS_TABLE,
      Item: newUser,
    };

    await docClient.send(new PutCommand(putParams));
    const token = jwt.sign({ _id: userId }, JWT_SECRET);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'x-auth-token': token,
      },
      body: token,
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