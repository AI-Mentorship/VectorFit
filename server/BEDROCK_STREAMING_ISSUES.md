# Bedrock Agent Trace Events Not Streaming - Analysis & Fix

## 🔍 Issues Found

Based on analysis of your code and AWS Bedrock documentation, I've identified **3 critical issues**:

### Issue #1: Trace Event Structure Misunderstanding ⚠️

**Problem in code (line 292-340 in app.mjs)**:
```javascript
if (trace.orchestrationTrace) {
  const orchTrace = trace.orchestrationTrace;

  if (orchTrace.rationale) {
    // This might not exist in the structure you expect
  }
}
```

**Reality**: `orchestrationTrace` is a **tagged union** (only one field exists at a time):
- Either `modelInvocationInput`
- OR `rationale`
- OR `invocationInput`
- OR `observation`
- OR `modelInvocationOutput`

You're checking all of these as if they could coexist, but **only ONE** will be present in any single trace event.

### Issue #2: Missing StreamFinalResponse Configuration 🚨

**Your code (line 262-275)** is missing a critical parameter:
```javascript
const agentCommand = new InvokeAgentCommand({
  agentId: BEDROCK_AGENT_ID,
  agentAliasId: BEDROCK_AGENT_ALIAS_ID,
  sessionId: currentChatId,
  inputText: message + closetContext,
  sessionState: {
    sessionAttributes: {...}
  },
  enableTrace: true
});
```

**Problem**: When `enableTrace: true`, the final response often appears **inside trace events** instead of as separate chunks!

**Solution**: Add `streamingConfigurations`:
```javascript
const agentCommand = new InvokeAgentCommand({
  // ... existing parameters ...
  streamingConfigurations: {
    streamFinalResponse: true,  // Critical for getting separate chunks!
    applyGuardrailInterval: 50
  }
});
```

### Issue #3: Not Handling All Trace Types 📊

**Your code only checks** `trace.orchestrationTrace`, but there are other trace types:
- `preProcessingTrace` - Initial processing
- `postProcessingTrace` - Final shaping
- `failureTrace` - Errors
- `guardrailTrace` - Guardrail actions

You're missing valuable thinking steps from pre/post processing!

## 🛠️ The Fix

### 1. Update the Trace Event Handling

The current structure assumes all fields coexist. They don't.

**Current (Wrong)**:
```javascript
if (trace.orchestrationTrace) {
  const orchTrace = trace.orchestrationTrace;
  if (orchTrace.rationale) { /* ... */ }
  if (orchTrace.invocationInput) { /* ... */ }
  if (orchTrace.observation) { /* ... */ }
  if (orchTrace.modelInvocationInput) { /* ... */ }
}
```

**Correct**:
```javascript
if (chunkEvent.trace?.orchestrationTrace) {
  const orchTrace = chunkEvent.trace.orchestrationTrace;

  // Only ONE of these will exist per event
  if (orchTrace.rationale) {
    // Handle rationale
  } else if (orchTrace.invocationInput) {
    // Handle action invocation
  } else if (orchTrace.observation) {
    // Handle observation
  } else if (orchTrace.modelInvocationInput) {
    // Handle model input
  } else if (orchTrace.modelInvocationOutput) {
    // Might contain final response!
  }
}
```

### 2. Add streamingConfigurations

This ensures the final response comes as separate chunks, not embedded in traces.

### 3. Handle All Trace Types

```javascript
if (chunkEvent.trace) {
  const trace = chunkEvent.trace;

  // Pre-processing
  if (trace.preProcessingTrace) {
    await sendToClient(connectionId, {
      type: 'thinking',
      message: 'Analyzing your request...',
      traceType: 'preprocessing'
    });
  }

  // Orchestration (main reasoning)
  if (trace.orchestrationTrace) {
    // Handle orchestration traces
  }

  // Post-processing
  if (trace.postProcessingTrace) {
    await sendToClient(connectionId, {
      type: 'thinking',
      message: 'Finalizing response...',
      traceType: 'postprocessing'
    });
  }

  // Failures
  if (trace.failureTrace) {
    console.error('Agent failure:', trace.failureTrace);
  }
}
```

## 📋 Complete Fix

I'll provide the complete corrected Lambda function.

## ⚡ Why Thinking Steps Aren't Showing

**Most likely reasons** (in order of probability):

1. **streamingConfigurations missing** - Response embedded in traces, not streaming properly
2. **Trace structure misunderstanding** - Events are firing but being ignored due to incorrect conditionals
3. **Simple queries** - Very simple requests might not generate many trace events
4. **Agent not configured properly** - Missing action groups means fewer orchestration steps

## 🧪 Testing

After applying the fix, test with:
1. **Simple query**: "What should I wear?" - Should show minimal traces
2. **Complex query with action**: "What should I wear to a wedding?" (with Virtual Closet ON) - Should show:
   - Rationale trace
   - Action invocation trace
   - Observation trace
   - Final response

## 📊 Expected Trace Flow

For a query that uses GetVirtualCloset:

```
1. preProcessingTrace
   → "Analyzing your request..."

2. orchestrationTrace (rationale)
   → "I need to check your virtual closet..."

3. orchestrationTrace (invocationInput)
   → "Accessing VirtualClosetActions: GetVirtualCloset..."

4. orchestrationTrace (observation)
   → "Retrieved data, formulating response..."

5. orchestrationTrace (modelInvocationInput)
   → "Crafting your fashion advice..."

6. chunk events (the actual response)
   → Streams word by word

7. postProcessingTrace
   → "Finalizing response..."
```

You should see thinking messages at steps 1, 2, 3, 4, 5, and 7!

## 🚀 Implementation Priority

1. **Add `streamingConfigurations`** (highest priority - likely main issue)
2. **Fix trace event handling** (check for only one field at a time)
3. **Add pre/post processing traces** (extra thinking steps)
4. **Add detailed logging** (to debug what events actually arrive)

Let me create the fixed Lambda function for you.
