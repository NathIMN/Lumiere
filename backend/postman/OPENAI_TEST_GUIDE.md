# OpenAI Integration Test Payloads

## Quick Test Setup
1. Make sure your backend server is running on `http://localhost:5000`
2. Import the `openai-tests.json` collection into Postman, OR
3. Use the raw payloads below for manual testing

---

## 1. Basic Chatbot Message Test
**POST** `http://localhost:5000/api/chatbot/message`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": "Hello, I need help with my insurance policy. Can you explain the benefits?"
}
```

**Expected Response:**
- Status: 200 OK  
- Contains: `userMessage`, `aiResponse`, `timestamp`
- AI response should be relevant to insurance

---

## 2. Message Formalization Test (Casual → Professional)
**POST** `http://localhost:5000/api/chatbot/formalize`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": "hey there! i need 2 know about my claim status ASAP. its urgent!!!"
}
```

**Expected Response:**
- Status: 200 OK
- `originalMessage`: original text
- `formalizedMessage`: professional version
- `wasFormalized`: true
- Should convert to something like: "I would like to inquire about the status of my claim. This matter is urgent."

---

## 3. Stream Response Test (Real-time)
**POST** `http://localhost:5000/api/chatbot/stream`

**Headers:**
```
Content-Type: application/json
Accept: text/event-stream
```

**Body (raw JSON):**
```json
{
  "message": "Can you explain the different types of life insurance policies?"
}
```

**Expected Response:**
- Status: 200 OK
- Content-Type: text/event-stream
- Multiple `data:` chunks with JSON objects
- Final chunk with `type: "complete"`

---

## 4. Error Handling Test (Empty Message)
**POST** `http://localhost:5000/api/chatbot/message`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": ""
}
```

**Expected Response:**
- Status: 400 Bad Request
- Error message: "Message is required"

---

## 5. Complex Insurance Query Test
**POST** `http://localhost:5000/api/chatbot/message`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": "I'm 35 years old, married with two children. I want to compare term life insurance vs whole life insurance. What are the pros and cons of each, and which would be better for my situation?"
}
```

**Expected Response:**
- Status: 200 OK
- Detailed comparison of insurance types
- Personalized recommendations based on age/family situation

---

## 6. Long Message Formalization Test
**POST** `http://localhost:5000/api/chatbot/formalize`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "message": "omg this is so confusing!!! i filed a claim like 3 weeks ago and still havent heard anything back. i called twice but nobody picked up. this is really frustrating cuz i need the money to fix my car. can someone PLEASE tell me whats going on???"
}
```

**Expected Response:**
- Status: 200 OK
- Professional version preserving key details
- Should maintain urgency but remove emotional language
- Example: "I submitted a claim approximately three weeks ago and have not received any updates. I have attempted to contact your office twice without success. I urgently need information regarding the status of my claim as I require the funds for vehicle repairs."

---

## Testing Notes:

### Success Indicators:
✅ All endpoints return proper HTTP status codes  
✅ Message endpoint provides relevant AI responses  
✅ Formalize endpoint improves message professionalism  
✅ Stream endpoint sends real-time chunks  
✅ Error handling works for invalid inputs  

### Troubleshooting:
- If you get "AI features will be disabled" in console, check your OPENAI_API_KEY in .env
- If streaming doesn't work in Postman, try using curl or a browser for SSE testing
- Check backend console logs for detailed error messages

### Performance Testing:
- Test with various message lengths (short, medium, long)
- Try concurrent requests to test rate limiting
- Monitor response times (should be < 30 seconds for most queries)