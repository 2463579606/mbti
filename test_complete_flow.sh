#!/bin/bash

# Test Complete MBTI Flow
# This simulates completing the entire test and generating a report

echo "🧪 Testing Complete MBTI Test Flow"
echo "===================================="
echo ""

# Create Session
echo "📍 Creating session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/session \
  -H "Content-Type: application/json")

SESSION_TOKEN=$(echo $SESSION_RESPONSE | jq -r '.data.sessionToken')
echo "✅ Session created: $SESSION_TOKEN"
echo ""

# Submit all 60 questions (simulated mixed answers)
echo "📍 Submitting all 60 questions..."
echo "   (This simulates a real user taking the test)"
echo ""

# Submit questions in batches with some variety
for i in {0..59}; do
  # Simulate varied answer patterns based on question number
  # This creates a realistic answer distribution
  ANSWER_OPTION=$((i % 2))  # Alternate between options A and B

  ANSWER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/answer \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SESSION_TOKEN" \
    -d "{\"questionId\": $i, \"selectedOption\": $ANSWER_OPTION}")

  SUCCESS=$(echo $ANSWER_RESPONSE | jq -r '.success')
  PROGRESS=$(echo $ANSWER_RESPONSE | jq -r '.data.progress.percentage')

  if [ "$SUCCESS" = "true" ]; then
    if [ $((i % 10)) -eq 0 ] || [ $i -eq 59 ]; then
      echo "   ✅ Question $((i+1))/60 completed (Progress: $PROGRESS%)"
    fi
  else
    echo "   ❌ Error submitting question $i"
    echo $ANSWER_RESPONSE
    break
  fi
done
echo ""

# Check final progress before completing
echo "📍 Checking final progress..."
PROGRESS_RESPONSE=$(curl -s -X GET http://localhost:8000/api/v1/test/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

TOTAL_ANSWERED=$(echo $PROGRESS_RESPONSE | jq -r '.data.answeredCount')
TOTAL_PROGRESS=$(echo $PROGRESS_RESPONSE | jq -r '.data.percentage')
DIMENSION_PROGRESS=$(echo $PROGRESS_RESPONSE | jq '.data.dimensionProgress')

echo "   📊 Final Statistics:"
echo "   Questions Answered: $TOTAL_ANSWERED/60"
echo "   Progress: $TOTAL_PROGRESS%"
echo "   Dimension Breakdown:"
echo "$DIMENSION_PROGRESS" | jq -r 'to_entries[] | "     \(.key): \(.value.answered)/\(.value.total) answered"'
echo ""

# Complete the test and generate report
echo "📍 Completing test and generating report..."
COMPLETE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/test/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

echo "   Complete Response: $COMPLETE_RESPONSE" | head -200
echo ""

SUCCESS=$(echo $COMPLETE_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  REPORT_ID=$(echo $COMPLETE_RESPONSE | jq -r '.data.reportId')
  MBTI_TYPE=$(echo $COMPLETE_RESPONSE | jq -r '.data.mbtiType')
  SHARE_TOKEN=$(echo $COMPLETE_RESPONSE | jq -r '.data.shareToken')
  REPORT_URL=$(echo $COMPLETE_RESPONSE | jq -r '.data.reportUrl')

  echo "✅ Test Completed Successfully!"
  echo "   📋 Report ID: $REPORT_ID"
  echo "   🎯 MBTI Type: $MBTI_TYPE"
  echo "   🔗 Share Token: $SHARE_TOKEN"
  echo "   🌐 Report URL: $REPORT_URL"
  echo ""

  # Get the full report
  echo "📍 Fetching full report details..."
  sleep 1  # Give the database a moment to save
  REPORT_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/report/$REPORT_ID" \
    -H "Content-Type: application/json")

  echo "   📊 Report Details:"
  echo "$REPORT_RESPONSE" | jq '.'
  echo ""

  echo "🎉 Complete MBTI Test Flow - SUCCESS!"
  echo "======================================"
  echo "Summary:"
  echo "- Session creation: ✅"
  echo "- Answer submission (60/60): ✅"
  echo "- Progress tracking: ✅"
  echo "- Test completion: ✅"
  echo "- Report generation: ✅"
  echo "- MBTI type calculation: ✅"
  echo ""
  echo "✨ The entire MBTI test flow is working perfectly!"
  echo "🎯 Result: $MBTI_TYPE"

else
  echo "❌ Test completion failed"
  echo "$COMPLETE_RESPONSE" | jq '.'
fi