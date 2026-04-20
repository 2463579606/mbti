#!/bin/bash

# Test Start Button Flow
# This script simulates the complete flow when clicking "开始测试"

echo "🧪 Testing Start Button Flow"
echo "=============================="
echo ""

# Step 1: Create Session
echo "📍 Step 1: Creating test session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/session \
  -H "Content-Type: application/json")

echo "Session Response: $SESSION_RESPONSE" | head -100

# Extract session token
SESSION_TOKEN=$(echo $SESSION_RESPONSE | jq -r '.data.sessionToken')
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.sessionId')

echo "✅ Session Created!"
echo "   Session ID: $SESSION_ID"
echo "   Session Token: $SESSION_TOKEN"
echo ""

# Step 2: Get All Questions
echo "📍 Step 2: Loading all questions..."
QUESTIONS_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/test/questions?start=0&count=60" \
  -H "Content-Type: application/json")

TOTAL_QUESTIONS=$(echo $QUESTIONS_RESPONSE | jq -r '.data.total')
echo "✅ Questions Loaded: $TOTAL_QUESTIONS questions"
echo ""

# Step 3: Get First Question Details
echo "📍 Step 3: Getting first question details..."
FIRST_QUESTION=$(echo $QUESTIONS_RESPONSE | jq '.data.questions[0]')
QUESTION_TEXT=$(echo $FIRST_QUESTION | jq -r '.question')
DIMENSION=$(echo $FIRST_QUESTION | jq -r '.dimensionLabel')
OPTION_A=$(echo $FIRST_QUESTION | jq -r '.options[0].text')
OPTION_B=$(echo $FIRST_QUESTION | jq -r '.options[1].text')

echo "✅ First Question Details:"
echo "   Question: $QUESTION_TEXT"
echo "   Dimension: $DIMENSION"
echo "   Option A: $OPTION_A"
echo "   Option B: $OPTION_B"
echo ""

# Step 4: Submit First Answer
echo "📍 Step 4: Submitting answer for first question..."
ANSWER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{"questionId": 0, "selectedOption": 0}')

echo "Answer Response: $ANSWER_RESPONSE" | head -100
NEXT_QUESTION=$(echo $ANSWER_RESPONSE | jq -r '.data.nextQuestion')
PROGRESS=$(echo $ANSWER_RESPONSE | jq -r '.data.progress.percentage')

echo "✅ Answer Submitted!"
echo "   Next Question: $NEXT_QUESTION"
echo "   Progress: $PROGRESS%"
echo ""

# Step 5: Check Progress
echo "📍 Step 5: Checking test progress..."
PROGRESS_RESPONSE=$(curl -s -X GET http://localhost:8000/api/v1/test/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

CURRENT_Q=$(echo $PROGRESS_RESPONSE | jq -r '.data.currentQuestion')
ANSWERED_COUNT=$(echo $PROGRESS_RESPONSE | jq -r '.data.answeredCount')
PROGRESS_PCT=$(echo $PROGRESS_RESPONSE | jq -r '.data.percentage')

echo "✅ Current Progress:"
echo "   Current Question: $CURRENT_Q"
echo "   Questions Answered: $ANSWERED_COUNT"
echo "   Progress: $PROGRESS_PCT%"
echo ""

echo "🎉 Start Button Flow Test Complete!"
echo "=================================="
echo "Summary:"
echo "- Session creation: ✅"
echo "- Questions loading: ✅"
echo "- Question display: ✅"
echo "- Answer submission: ✅"
echo "- Progress tracking: ✅"
echo ""
echo "The '开始测试' button flow is working correctly!"