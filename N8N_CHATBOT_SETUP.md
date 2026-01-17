# TinyStep AI Chatbot - n8n Workflow Setup Guide

## 📋 Overview

This n8n workflow powers the TinyStep AI chatbot with context-aware responses based on:
- **User's care mode** (Planning, Pregnancy, Baby Care)
- **Database data** (User info, baby details, pregnancy data)
- **Universal AI knowledge** (OpenAI GPT-4)

---

## 🚀 Quick Start

### 1. Import Workflow to n8n

1. Open your n8n instance (http://localhost:5678)
2. Click **"Import from File"**
3. Select `n8n-chatbot-workflow.json`
4. The workflow will be imported with all nodes

### 2. Configure Credentials

#### MongoDB Connection
1. Go to **Credentials** → **Create New**
2. Select **MongoDB**
3. Enter your connection details:
   ```
   Connection String: mongodb://localhost:27017/tinystep
   Database: tinystep
   ```
4. Name it: `MongoDB - TinyStep`
5. **Test** and **Save**

#### OpenAI API
1. Go to **Credentials** → **Create New**
2. Select **OpenAI API**
3. Enter your API key:
   ```
   API Key: sk-xxxxxxxxxxxxxxxxxxxxx
   ```
4. Name it: `OpenAI API`
5. **Test** and **Save**

### 3. Activate Webhook

1. Click on **"Webhook - Receive Chat"** node
2. Click **"Test workflow"**
3. Copy the **Production webhook URL**
4. It should look like:
   ```
   http://localhost:5678/webhook/tinystep-chatbot
   ```

### 4. Update Backend Environment

Add to `.env` file:
```env
N8N_CHATBOT_URL=http://localhost:5678/webhook/tinystep-chatbot
```

### 5. Activate Workflow

1. Toggle **"Active"** switch in top-right corner
2. Workflow is now listening for requests!

---

## 🔄 Workflow Flow

```
1. Frontend → POST /api/ai/chat → Backend
2. Backend → Webhook → n8n
3. n8n → Get User Data (MongoDB)
4. n8n → Get Baby Data (MongoDB)
5. n8n → Build AI Context (with care mode)
6. n8n → OpenAI Chat (GPT-4)
7. n8n → Format Response
8. n8n → Return to Backend
9. Backend → Return to Frontend
10. Frontend → Display in Chatbot
```

---

## 📊 Workflow Nodes Explained

### Node 1: Webhook - Receive Chat
- **Type**: Webhook Trigger
- **Method**: POST
- **Path**: `/webhook/tinystep-chatbot`
- **Receives**:
  ```json
  {
    "userId": "user123",
    "message": "What should I eat during pregnancy?",
    "context": {
      "careMode": "pregnancy"
    },
    "conversationHistory": []
  }
  ```

### Node 2: Get User Data
- **Type**: MongoDB Query
- **Collection**: `users`
- **Query**: Find user by `_id`
- **Returns**: User profile with care mode data

### Node 3: Get Baby Data
- **Type**: MongoDB Query
- **Collection**: `babies`
- **Query**: Find all babies for parent
- **Returns**: Array of baby profiles

### Node 4: Build AI Context
- **Type**: Code Node (JavaScript)
- **Function**: Combines user data + baby data + care mode into AI prompt
- **Output**: Structured messages array for OpenAI

### Node 5: OpenAI Chat
- **Type**: OpenAI API
- **Model**: GPT-4 Turbo (or GPT-3.5)
- **Settings**:
  - Temperature: 0.7 (balanced creativity)
  - Max Tokens: 500 (concise responses)

### Node 6: Format Response
- **Type**: Code Node
- **Function**: Extracts AI response and formats for frontend

### Node 7: Respond to Webhook
- **Type**: Webhook Response
- **Returns**:
  ```json
  {
    "success": true,
    "data": {
      "response": "During pregnancy, focus on...",
      "timestamp": "2026-01-17T10:00:00Z",
      "careMode": "pregnancy"
    }
  }
  ```

### Node 8: Error Handler
- **Type**: Code Node
- **Triggers**: On any node failure
- **Returns**: Friendly error message

---

## 🎯 Context-Aware Responses

The AI system provides different responses based on care mode:

### 🌸 Planning Mode
```javascript
Context includes:
- Last Period Date
- Cycle Length (default 28 days)
- Period Duration (default 5 days)
- Ovulation predictions

Example Questions:
- "When is my fertile window?"
- "What vitamins should I take?"
- "How can I improve fertility?"
```

### 🤰 Pregnancy Mode
```javascript
Context includes:
- Weeks Pregnant (calculated from LMP)
- Expected Due Date
- Trimester information

Example Questions:
- "What foods should I avoid?"
- "Is it normal to feel tired?"
- "What happens at week 12?"
```

### 👶 Baby Care Mode
```javascript
Context includes:
- Baby names, ages (in months)
- Gender
- Multiple babies support

Example Questions:
- "When should my baby start solids?"
- "How much should a 6-month-old sleep?"
- "What are developmental milestones?"
```

---

## 🔧 Customization Options

### Change AI Model

In **OpenAI Chat** node:
```json
{
  "model": "gpt-4o-mini",  // Fast & cheap
  "model": "gpt-4-turbo",  // Best quality
  "model": "gpt-3.5-turbo" // Budget option
}
```

### Adjust Response Length

In **OpenAI Chat** node options:
```json
{
  "maxTokens": 300,  // Shorter responses
  "maxTokens": 500,  // Default
  "maxTokens": 1000  // Longer, detailed responses
}
```

### Modify AI Personality

Edit the `systemPrompt` in **Build AI Context** node:
```javascript
const systemPrompt = `You are TinyStep AI Assistant...
- Be more casual / formal
- Use more / fewer emojis
- Focus on specific topics
- Add humor / be serious
`;
```

### Add Knowledge Base

Add a new node before OpenAI:
1. **Vector Store Search** (for embeddings)
2. **MongoDB Query** (for FAQs)
3. **HTTP Request** (for external APIs)

---

## 🧪 Testing

### Test with cURL

```bash
curl -X POST http://localhost:5678/webhook/tinystep-chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "message": "What should I know about pregnancy week 12?",
    "context": {
      "careMode": "pregnancy"
    },
    "conversationHistory": []
  }'
```

### Test from Frontend

1. Open any page with chatbot
2. Click purple chat button (bottom-right)
3. Type a question
4. Check response

### Debug in n8n

1. Click **"Execute Workflow"** in n8n
2. Manually trigger with test data
3. View each node's input/output
4. Check for errors in red nodes

---

## 📈 Monitoring & Logs

### View Workflow Executions
1. Go to **Executions** tab in n8n
2. See all past runs with timestamps
3. Click any execution to debug

### Check Logs
```bash
# n8n logs
docker logs n8n

# Backend logs
cd backend
npm start
# Check console output
```

### Error Handling

The workflow includes automatic fallbacks:
- MongoDB connection fails → Uses partial context
- OpenAI API fails → Returns friendly error
- Network timeout → Fallback message shown

---

## 🚀 Production Deployment

### For Render.com / Cloud

1. Update webhook URL in backend `.env`:
   ```env
   N8N_CHATBOT_URL=https://your-n8n-instance.com/webhook/tinystep-chatbot
   ```

2. Set environment variables in Render:
   - `OPENAI_API_KEY`
   - `MONGODB_URI`
   - `N8N_CHATBOT_URL`

3. Make sure n8n is accessible (not localhost)

### Security Best Practices

1. **Use HTTPS** for production webhooks
2. **Add authentication** to webhook (optional):
   ```javascript
   // In Webhook node, add header check
   if (req.headers['x-api-key'] !== 'YOUR_SECRET') {
     return { error: 'Unauthorized' };
   }
   ```
3. **Rate limiting** in backend (already implemented)
4. **Sanitize user inputs** before sending to AI

---

## 💡 Tips & Best Practices

### Response Quality
- Keep system prompts clear and specific
- Include relevant context only
- Limit conversation history to last 10 messages
- Use temperature 0.7 for balanced responses

### Cost Optimization
- Use GPT-3.5-turbo for simple questions
- Cache common responses (add Redis node)
- Limit max tokens to 500
- Implement rate limiting per user

### Performance
- Keep MongoDB queries optimized
- Add indexes on frequently queried fields
- Set reasonable timeouts (30s)
- Monitor n8n execution times

---

## 🐛 Troubleshooting

### Chatbot not responding

1. **Check n8n workflow is Active**
   - Toggle must be ON

2. **Check webhook URL is correct**
   ```bash
   echo $N8N_CHATBOT_URL
   ```

3. **Test webhook directly**
   ```bash
   curl -X POST $N8N_CHATBOT_URL -d '{"test":"message"}'
   ```

4. **Check OpenAI API key is valid**
   - Test in OpenAI playground

5. **Check MongoDB connection**
   - Verify connection string
   - Check database name

### Slow responses

1. Reduce `maxTokens` in OpenAI node
2. Optimize MongoDB queries (add indexes)
3. Reduce conversation history length
4. Check n8n server resources

### Incorrect context

1. Verify user data in MongoDB
2. Check care mode is set correctly
3. Review "Build AI Context" node logic
4. Test with sample data

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [MongoDB Query Docs](https://docs.mongodb.com/manual/tutorial/query-documents/)

---

## ✅ Setup Checklist

- [ ] Import workflow to n8n
- [ ] Configure MongoDB credentials
- [ ] Configure OpenAI API credentials  
- [ ] Copy webhook URL
- [ ] Update backend `.env` file
- [ ] Activate workflow in n8n
- [ ] Restart backend server
- [ ] Test chatbot from frontend
- [ ] Check n8n execution logs
- [ ] Deploy to production (if needed)

---

## 🎉 You're Done!

Your AI chatbot is now:
- ✅ Context-aware (knows user's stage)
- ✅ Database-connected (real user data)
- ✅ AI-powered (OpenAI GPT-4)
- ✅ Production-ready

Happy chatting! 🤖💬
