import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from '@aws-sdk/client-apigatewaymanagementapi';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const bedrockClient = new BedrockAgentRuntimeClient({ region: 'us-east-1' });

const CHAT_HISTORIES_TABLE = process.env.CHAT_HISTORIES_TABLE;
const CHAT_MESSAGES_TABLE = process.env.CHAT_MESSAGES_TABLE;
const CLOTHE_ITEMS_TABLE = process.env.CLOTHE_ITEMS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET || 'secretstring1234';
const BEDROCK_AGENT_ID = process.env.BEDROCK_AGENT_ID;
const BEDROCK_AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID;

let apigwManagementApi;

/**
 * Send message to WebSocket client
 */
async function sendToClient(connectionId, data) {
  try {
    await apigwManagementApi.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    }));
  } catch (error) {
    console.error('Error sending to client:', error);
    if (error.statusCode === 410) {
      console.log('Stale connection, removing...');
    }
  }
}

/**
 * Generate chat name - simple counter-based naming
 */
async function generateChatName(userId) {
  try {
    // Get count of existing chats for this user
    const result = await docClient.send(new QueryCommand({
      TableName: CHAT_HISTORIES_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      Select: 'COUNT'
    }));

    const chatNumber = (result.Count || 0) + 1;
    return `Chat ${chatNumber}`;
  } catch (error) {
    console.error('Error generating chat name:', error);
    return `Chat ${Date.now()}`;
  }
}

/**
 * Get user's virtual closet items
 */
async function getUserCloset(userId) {
  try {
    const params = {
      TableName: CLOTHE_ITEMS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];
  } catch (error) {
    console.error('Error fetching user closet:', error);
    return [];
  }
}

/**
 * Main Lambda handler
 */
export const lambdaHandler = async (event) => {
  console.log('WebSocket Message:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  // Initialize API Gateway Management API
  apigwManagementApi = new ApiGatewayManagementApiClient({
    endpoint: `https://${domain}/${stage}`
  });

  try {
    const body = JSON.parse(event.body);
    const { message, chatId, token, useVirtualCloset = false } = body;

    if (!message) {
      await sendToClient(connectionId, {
        type: 'error',
        error: 'Message is required'
      });
      return { statusCode: 400 };
    }

    if (!token) {
      await sendToClient(connectionId, {
        type: 'error',
        error: 'Authentication token is required'
      });
      return { statusCode: 401 };
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      await sendToClient(connectionId, {
        type: 'error',
        error: 'Invalid or expired token'
      });
      return { statusCode: 401 };
    }

    const userId = decoded._id;
    const messageId = uuidv4();
    let currentChatId = chatId;

    // Create new chat if chatId not provided
    if (!currentChatId) {
      currentChatId = uuidv4();

      // Generate chat name
      const chatName = await generateChatName(userId);

      // Create chat history entry
      await docClient.send(new PutCommand({
        TableName: CHAT_HISTORIES_TABLE,
        Item: {
          chatId: currentChatId,
          userId: userId,
          chatName: chatName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0
        }
      }));

      await sendToClient(connectionId, {
        type: 'chatCreated',
        chatId: currentChatId,
        chatName: chatName
      });
    }

    // Save user message to DynamoDB
    const userMessageItem = {
      messageId: messageId,
      chatId: currentChatId,
      userId: userId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: userMessageItem
    }));

    // Update chat history message count and timestamp
    await docClient.send(new UpdateCommand({
      TableName: CHAT_HISTORIES_TABLE,
      Key: { chatId: currentChatId },
      UpdateExpression: 'SET updatedAt = :updatedAt, messageCount = if_not_exists(messageCount, :zero) + :inc',
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
        ':zero': 0,
        ':inc': 1
      }
    }));

    // Send user message confirmation
    await sendToClient(connectionId, {
      type: 'userMessage',
      message: userMessageItem
    });

    // Check if Bedrock Agent is configured
    const isAgentConfigured = BEDROCK_AGENT_ID && 
                              BEDROCK_AGENT_ALIAS_ID && 
                              BEDROCK_AGENT_ID !== 'PLACEHOLDER' &&
                              BEDROCK_AGENT_ID.length <= 10;

    let botResponse = '';

    if (!isAgentConfigured) {
      // Fallback to dummy response if agent not configured
      const chatHistoryResult = await docClient.send(new QueryCommand({
        TableName: CHAT_HISTORIES_TABLE,
        KeyConditionExpression: 'chatId = :chatId',
        ExpressionAttributeValues: {
          ':chatId': currentChatId
        },
        Limit: 1
      }));

      const chatHistory = chatHistoryResult.Items?.[0];
      const chatName = chatHistory?.chatName || 'Unknown';
      const chatNumber = chatName.replace('Chat ', '');

      // Show thinking steps
      const thinkingSteps = [
        'Step 1: Analyzing your request...',
        'Step 2: Processing context...',
        'Step 3: Formulating response...'
      ];

      for (let i = 0; i < thinkingSteps.length; i++) {
        await sendToClient(connectionId, {
          type: 'thinking',
          message: thinkingSteps[i],
          stepNumber: i + 1,
          totalSteps: thinkingSteps.length
        });
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      botResponse = `AI Agent is not configured yet. Please set BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID. (Chat ${chatNumber})`;

      // Stream dummy response
      await sendToClient(connectionId, { type: 'streamStart' });
      const words = botResponse.split(' ');
      for (const word of words) {
        await sendToClient(connectionId, { type: 'chunk', chunk: word + ' ' });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      // Use Bedrock Agent for real AI responses
      // Get user's virtual closet if enabled
      let closetContext = '';
      if (useVirtualCloset) {
        const closetItems = await getUserCloset(userId);
        if (closetItems.length > 0) {
          closetContext = '\n\n[User has enabled virtual closet access. You can see their items via the GetVirtualCloset action.]';
        } else {
          closetContext = '\n\n[User enabled virtual closet but has no items yet. Suggest general outfits.]';
        }
      }

      // Invoke Bedrock Agent with trace enabled
      try {
        console.log('🤖 Invoking Bedrock Agent with:');
        console.log('  - AgentId:', BEDROCK_AGENT_ID);
        console.log('  - AgentAliasId:', BEDROCK_AGENT_ALIAS_ID);
        console.log('  - SessionId:', currentChatId);
        console.log('  - UseVirtualCloset:', useVirtualCloset);
        console.log('  - EnableTrace:', true);
        console.log('  - Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
        
        const agentCommand = new InvokeAgentCommand({
          agentId: BEDROCK_AGENT_ID,
          agentAliasId: BEDROCK_AGENT_ALIAS_ID,
          sessionId: currentChatId, // Use chatId as session for memory
          inputText: message + closetContext,
          sessionState: {
            sessionAttributes: {
              userId,
              useVirtualCloset: useVirtualCloset.toString(),
              connectionId,
            },
          },
          enableTrace: true, // Enable to get agent's thinking process
          streamingConfigurations: {
            streamFinalResponse: true, // Stream response as separate chunks
            applyGuardrailInterval: 50
          }
        });

        console.log('📡 Sending command to Bedrock Agent...');
        const response = await bedrockClient.send(agentCommand);

        if (!response.completion) {
          throw new Error('No completion received from Bedrock agent');
        }

        console.log('✅ Got completion stream from Bedrock Agent');
        
        // Send initial thinking message while waiting for first event
        await sendToClient(connectionId, {
          type: 'thinking',
          message: 'Processing your request...',
          traceType: 'initial'
        });
        console.log('✅ Sent initial thinking message to client');
        
        let hasStartedStreaming = false;
        let hasReceivedAnyTrace = false;

        // Stream the response chunks and trace events
        for await (const chunkEvent of response.completion) {
          // Log the raw event for debugging
          console.log('🔍 Raw Bedrock event received:', JSON.stringify(chunkEvent, null, 2));

          // Handle trace events - these show what the agent is thinking/doing
          if (chunkEvent.trace) {
            const trace = chunkEvent.trace;
            hasReceivedAnyTrace = true;
            console.log('🧠 TRACE EVENT DETECTED');

            // Pre-processing trace
            if (trace.preProcessingTrace) {
              console.log('📝 PreProcessing trace:', JSON.stringify(trace.preProcessingTrace, null, 2));
              await sendToClient(connectionId, {
                type: 'thinking',
                message: 'Analyzing your request...',
                traceType: 'preprocessing'
              });
              console.log('✅ Sent preprocessing thinking message to client');
            }

            // Orchestration trace shows the agent's reasoning
            // NOTE: orchestrationTrace is a UNION - only ONE field exists at a time
            if (trace.orchestrationTrace) {
              const orchTrace = trace.orchestrationTrace;
              console.log('🎯 Orchestration trace:', JSON.stringify(orchTrace, null, 2));

              // Agent's rationale (what it's thinking) - UNION MEMBER
              if (orchTrace.rationale) {
                const rationaleText = orchTrace.rationale.text || 'Thinking...';
                console.log('💭 RATIONALE:', rationaleText);
                await sendToClient(connectionId, {
                  type: 'thinking',
                  message: rationaleText,
                  traceType: 'rationale'
                });
                console.log('✅ Sent rationale thinking message to client');
              }
              // When agent is calling an action/tool - UNION MEMBER
              else if (orchTrace.invocationInput) {
                const invInput = orchTrace.invocationInput;
                console.log('🔧 INVOCATION INPUT:', JSON.stringify(invInput, null, 2));
                
                if (invInput.invocationType === 'ACTION_GROUP') {
                  const actionName = invInput.actionGroupInvocationInput?.actionGroupName;
                  const functionName = invInput.actionGroupInvocationInput?.function;
                  const message = `Accessing ${actionName || 'tool'}: ${functionName || 'function'}...`;
                  console.log('🛠️ ACTION GROUP:', message);
                  await sendToClient(connectionId, {
                    type: 'thinking',
                    message: message,
                    traceType: 'action'
                  });
                  console.log('✅ Sent action thinking message to client');
                } else if (invInput.invocationType === 'KNOWLEDGE_BASE') {
                  console.log('📚 KNOWLEDGE BASE LOOKUP');
                  await sendToClient(connectionId, {
                    type: 'thinking',
                    message: 'Searching knowledge base...',
                    traceType: 'action'
                  });
                  console.log('✅ Sent knowledge base thinking message to client');
                }
              }
              // Results from action/tool calls - UNION MEMBER
              else if (orchTrace.observation) {
                const obs = orchTrace.observation;
                console.log('👁️ OBSERVATION:', JSON.stringify(obs, null, 2));
                
                if (obs.actionGroupInvocationOutput) {
                  await sendToClient(connectionId, {
                    type: 'thinking',
                    message: 'Retrieved data, formulating response...',
                    traceType: 'observation'
                  });
                  console.log('✅ Sent observation thinking message to client');
                } else if (obs.knowledgeBaseLookupOutput) {
                  await sendToClient(connectionId, {
                    type: 'thinking',
                    message: 'Found relevant information...',
                    traceType: 'observation'
                  });
                  console.log('✅ Sent knowledge base observation thinking message to client');
                }
              }
              // When agent is generating input for model - UNION MEMBER
              else if (orchTrace.modelInvocationInput) {
                console.log('🎨 MODEL INVOCATION INPUT (hasStartedStreaming:', hasStartedStreaming, ')');
                if (!hasStartedStreaming) {
                  await sendToClient(connectionId, {
                    type: 'thinking',
                    message: 'Crafting your fashion advice...',
                    traceType: 'generating'
                  });
                  console.log('✅ Sent generating thinking message to client');
                }
              }
              // Model's output (might contain final response) - UNION MEMBER
              else if (orchTrace.modelInvocationOutput) {
                console.log('📤 Model invocation output received');
                // Don't send this as thinking - final response should come as chunks
              }
            }

            // Post-processing trace
            if (trace.postProcessingTrace) {
              console.log('🏁 PostProcessing trace:', JSON.stringify(trace.postProcessingTrace, null, 2));
              if (trace.postProcessingTrace.modelInvocationOutput) {
                await sendToClient(connectionId, {
                  type: 'thinking',
                  message: 'Finalizing response...',
                  traceType: 'postprocessing'
                });
                console.log('✅ Sent postprocessing thinking message to client');
              }
            }

            // Failure trace
            if (trace.failureTrace) {
              console.error('❌ Failure trace:', JSON.stringify(trace.failureTrace, null, 2));
              await sendToClient(connectionId, {
                type: 'thinking',
                message: 'Encountered an issue, retrying...',
                traceType: 'error'
              });
              console.log('✅ Sent failure thinking message to client');
            }

            // Guardrail trace
            if (trace.guardrailTrace) {
              console.log('🛡️ Guardrail trace:', JSON.stringify(trace.guardrailTrace, null, 2));
            }
          }

          // Handle actual response chunks
          if (chunkEvent.chunk && chunkEvent.chunk.bytes) {
            // Signal start of response streaming on first chunk
            if (!hasStartedStreaming) {
              console.log('🚀 FIRST CHUNK RECEIVED - Sending streamStart to client');
              await sendToClient(connectionId, { type: 'streamStart' });
              hasStartedStreaming = true;
            }

            const decodedChunk = new TextDecoder('utf-8').decode(chunkEvent.chunk.bytes);
            botResponse += decodedChunk;
            
            console.log('📝 Chunk:', decodedChunk.substring(0, 50) + (decodedChunk.length > 50 ? '...' : ''));
            
            // Send chunk to client
            await sendToClient(connectionId, {
              type: 'chunk',
              chunk: decodedChunk
            });
          } else if (!chunkEvent.trace) {
            // Log if we receive an event that's neither trace nor chunk
            console.log('⚠️ Unknown event type:', Object.keys(chunkEvent));
          }
        }
        
        console.log('✅ Completed processing all events from Bedrock Agent');
        console.log('📊 Summary:');
        console.log('  - Received any trace events:', hasReceivedAnyTrace);
        console.log('  - Started streaming:', hasStartedStreaming);
        console.log('  - Response length:', botResponse.length);
        
        if (!hasReceivedAnyTrace) {
          console.warn('⚠️ WARNING: No trace events were received from Bedrock Agent!');
          console.warn('   This could mean:');
          console.warn('   1. The agent is not configured to generate traces');
          console.warn('   2. The query was too simple and didn\'t require reasoning');
          console.warn('   3. There\'s an issue with the agent configuration');
        }
      } catch (agentError) {
        console.error('Bedrock Agent error:', agentError);
        botResponse = `I apologize, but I encountered an error: ${agentError.message}. Please try again.`;
        
        // Send error as streaming response
        await sendToClient(connectionId, { type: 'streamStart' });
        for (const word of botResponse.split(' ')) {
          await sendToClient(connectionId, { type: 'chunk', chunk: word + ' ' });
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }

    // Save assistant response to DynamoDB
    const assistantMessageId = uuidv4();
    const assistantMessageItem = {
      messageId: assistantMessageId,
      chatId: currentChatId,
      userId: userId,
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: assistantMessageItem
    }));

    // Update chat history message count
    await docClient.send(new UpdateCommand({
      TableName: CHAT_HISTORIES_TABLE,
      Key: { chatId: currentChatId },
      UpdateExpression: 'SET updatedAt = :updatedAt, messageCount = messageCount + :inc',
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
        ':inc': 1
      }
    }));

    // Send completion
    await sendToClient(connectionId, {
      type: 'complete',
      message: assistantMessageItem
    });

    return { statusCode: 200 };

  } catch (error) {
    console.error('Error processing message:', error);

    await sendToClient(connectionId, {
      type: 'error',
      error: error.message
    });

    return { statusCode: 500 };
  }
};
