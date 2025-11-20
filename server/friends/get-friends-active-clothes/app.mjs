import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const USERS_TABLE = process.env.USERS_TABLE;
const CLOTHES_TABLE = process.env.CLOTHES_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;
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

    // Get current user to retrieve acceptedFriends
    const getUserParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: decoded._id,
      },
    };
    const userResult = await docClient.send(new GetCommand(getUserParams));

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const acceptedFriends = userResult.Item.acceptedFriends || [];

    if (acceptedFriends.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          friendsActiveClothes: [],
        }),
      };
    }

    // Get all friends' user data including their activeOutfit
    const friendsData = [];

    for (const friend of acceptedFriends) {
      try {
        // Query user by email using EmailIndex
        const queryParams = {
          TableName: USERS_TABLE,
          IndexName: 'EmailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': friend.email,
          },
        };

        const friendResult = await docClient.send(new QueryCommand(queryParams));

        if (friendResult.Items && friendResult.Items.length > 0) {
          const friendUser = friendResult.Items[0];
          const activeOutfit = friendUser.activeOutfit || { topId: null, bottomId: null };

          // Get clothing items for this friend's active outfit
          const activeClothes = [];

          if (activeOutfit.topId) {
            const topParams = {
              TableName: CLOTHES_TABLE,
              Key: {
                clotheItemId: activeOutfit.topId,
              },
            };
            const topResult = await docClient.send(new GetCommand(topParams));
            if (topResult.Item) {
              // Generate presigned URL for the image
              const imageUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                  Bucket: IMAGES_BUCKET,
                  Key: topResult.Item.imageKey,
                }),
                { expiresIn: 3600 } // 1 hour
              );

              activeClothes.push({
                clotheItemId: topResult.Item.clotheItemId,
                clothingType: topResult.Item.clothingType,
                dominantColor: topResult.Item.dominantColor,
                imageUrl: imageUrl,
                position: 'top',
              });
            }
          }

          if (activeOutfit.bottomId) {
            const bottomParams = {
              TableName: CLOTHES_TABLE,
              Key: {
                clotheItemId: activeOutfit.bottomId,
              },
            };
            const bottomResult = await docClient.send(new GetCommand(bottomParams));
            if (bottomResult.Item) {
              // Generate presigned URL for the image
              const imageUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                  Bucket: IMAGES_BUCKET,
                  Key: bottomResult.Item.imageKey,
                }),
                { expiresIn: 3600 } // 1 hour
              );

              activeClothes.push({
                clotheItemId: bottomResult.Item.clotheItemId,
                clothingType: bottomResult.Item.clothingType,
                dominantColor: bottomResult.Item.dominantColor,
                imageUrl: imageUrl,
                position: 'bottom',
              });
            }
          }

          // Only add friend if they have active clothes
          if (activeClothes.length > 0) {
            friendsData.push({
              userName: friendUser.userName,
              firstName: friendUser.firstName,
              lastName: friendUser.lastName,
              email: friendUser.email,
              activeClothes: activeClothes,
              lastUpdated: friendUser.updatedAt || new Date().toISOString(),
            });
          }
        }
      } catch (friendError) {
        console.error(`Error fetching data for friend ${friend.email}:`, friendError);
        // Continue with other friends even if one fails
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        friendsActiveClothes: friendsData,
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
