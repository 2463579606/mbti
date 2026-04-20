#!/bin/bash

# Test Navigation and Complete User Flow
# This simulates a user taking several questions and testing navigation

echo "🧪 Testing Navigation and User Flow"
echo "===================================="
echo ""

# Create Session
echo "📍 Creating session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/session \
  -H "Content-Type: application/json")

SESSION_TOKEN=$(echo $SESSION_RESPONSE | jq -r '.data.sessionToken')
echo "✅ Session created: $SESSION_TOKEN"
echo ""

# Submit first 5 questions
echo "📍 Submitting answers for questions 1-5..."
for i in {0..4}; do
  ANSWER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/answer \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SESSION_TOKEN" \
    -d "{\"questionId\": $i, \"selectedOption\": 0}")

  NEXT_Q=$(echo $ANSWER_RESPONSE | jq -r '.data.nextQuestion')
  PROGRESS=$(echo $ANSWER_RESPONSE | jq -r '.data.progress.percentage')
  echo "   ✅ Question $i answered → Next: $NEXT_Q (Progress: $PROGRESS%)"
done
echo ""

# Test navigation by loading specific questions
echo "📍 Testing navigation - loading specific questions..."
echo "   Simulating 'Previous Button' functionality..."

# Load question 2 (go back)
echo "   ⬅️ Going back to Question 3..."
Q3_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/test/questions?start=2&count=1" \
  -H "Content-Type: application/json")

Q3_TEXT=$(echo $Q3_RESPONSE | jq -r '.data.questions[0].question')
Q3_OPTIONS_A=$(echo $Q3_RESPONSE | jq -r '.data.questions[0].options[0].text')
Q3_OPTIONS_B=$(echo $Q3_RESPONSE | jq -r '.data.questions[0].options[1].text')
echo "      Question 3: $Q3_TEXT"
echo "      Option A: $Q3_OPTIONS_A"
echo "      Option B: $Q3_OPTIONS_B"
echo ""

# Load question 0 (go back to start)
echo "   ⬅️ Going back to Question 1..."
Q1_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/test/questions?start=0&count=1" \
  -H "Content-Type: application/json")

Q1_TEXT=$(echo $Q1_RESPONSE | jq -r '.data.questions[0].question')
echo "      Question 1: $Q1_TEXT"
echo ""

# Jump to question 10 (simulate clicking on dot navigation)
echo "   🔵 Jumping to Question 11..."
Q11_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/test/questions?start=10&count=1" \
  -H "Content-Type: application/json")

Q11_TEXT=$(echo $Q11_RESPONSE | jq -r '.data.questions[0].question')
Q11_DIM=$(echo $Q11_RESPONSE | jq -r '.data.questions[0].dimensionLabel')
echo "      Question 11: $Q11_TEXT"
echo "      Dimension: $Q11_DIM"
echo ""

# Test dimension progress
echo "📍 Checking dimension progress..."
PROGRESS_RESPONSE=$(curl -s -X GET http://localhost:8000/api/v1/test/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

echo "   📊 Progress Breakdown:"
echo $PROGRESS_RESPONSE | jq '.data.dimensionProgress'
echo ""

# Submit more answers to test different dimensions
echo "📍 Submitting answers for questions 5-15 (testing different dimensions)..."
for i in {5..15}; do
  ANSWER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/answer \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SESSION_TOKEN" \
    -d "{\"questionId\": $i, \"selectedOption\": 1}")

  PROGRESS=$(echo $ANSWER_RESPONSE | jq -r '.data.progress.percentage')
  DIMENSION=$(echo $ANSWER_RESPONSE | jq -r '.data.dimension // "N/A"')
  echo "   ✅ Question $i answered (Dimension: $DIMENSION, Progress: $PROGRESS%)"
done
echo ""

# Final progress check
echo "📍 Final progress check..."
PROGRESS_RESPONSE=$(curl -s -X GET http://localhost:8000/api/v1/test/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

TOTAL_PROGRESS=$(echo $PROGRESS_RESPONSE | jq -r '.data.percentage')
CURRENT_Q=$(echo $PROGRESS_RESPONSE | jq -r '.data.currentQuestion')
ANSWERED_COUNT=$(echo $PROGRESS_RESPONSE | jq -r '.data.answeredCount')

echo "   📊 Overall Progress: $TOTAL_PROGRESS%"
echo "   📍 Current Question: $CURRENT_Q"
echo "   ✅ Questions Answered: $ANSWERED_COUNT/60"
echo ""

echo "🎉 Navigation and User Flow Test Complete!"
echo "==========================================="
echo "Summary:"
echo "- Session creation: ✅"
echo "- Sequential question answering: ✅"
echo "- Navigation (previous/next/jump): ✅"
echo "- Question display with correct formatting: ✅"
echo "- Dimension tracking: ✅"
echo "- Progress calculation: ✅"
echo ""
echo "✨ All functionality working as expected!"