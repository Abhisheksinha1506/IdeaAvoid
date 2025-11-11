#!/bin/bash

# Monitor validation progress
echo "🔍 Monitoring validation progress..."
echo "Press Ctrl+C to stop monitoring"
echo ""

while true; do
  clear
  echo "════════════════════════════════════════════════════════════"
  echo "📊 Validation Progress Monitor"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  
  # Check if process is running
  if ps aux | grep -v grep | grep "validateAllIdeas" > /dev/null; then
    echo "✅ Validation script is RUNNING"
    ps aux | grep -v grep | grep "validateAllIdeas" | awk '{print "   Process ID: " $2 "\n   CPU Usage: " $3 "%\n   Memory: " $4 "%\n   Runtime: " $10}'
  else
    echo "❌ Validation script is NOT running"
  fi
  
  echo ""
  echo "────────────────────────────────────────────────────────────"
  echo ""
  
  # Check progress
  node server/scripts/checkProgress.js
  
  echo ""
  echo "⏱️  Refreshing in 10 seconds... (Press Ctrl+C to stop)"
  sleep 10
done

