#!/bin/bash

echo "🚀 Pushing AI-Powered Backlink Opportunity Finder to GitHub..."
echo ""

# Test SSH connection first
echo "Testing SSH connection to GitHub..."
ssh -T git@github.com
if [ $? -eq 1 ]; then
    echo "✅ SSH connection successful!"
else
    echo "❌ SSH connection failed. Make sure you've added your SSH key to GitHub:"
    echo "   1. Go to GitHub.com → Settings → SSH and GPG keys"
    echo "   2. Click 'New SSH key'"
    echo "   3. Paste your public key:"
    cat ~/.ssh/id_ed25519.pub
    exit 1
fi

echo ""
echo "Pushing to https://github.com/KaiKI099/backlink-tester..."

# Push to GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your AI-powered backlink finder is now on GitHub!"
    echo "🔗 Repository: https://github.com/KaiKI099/backlink-tester"
    echo ""
    echo "Features uploaded:"
    echo "✅ Automated page discovery with intelligent web search"
    echo "✅ Multi-page analysis (up to 5 pages per search)"
    echo "✅ Enhanced login form and UGC detection"
    echo "✅ Local Ollama AI integration (qwen2.5:32b-instruct-q4_K_M)"
    echo "✅ React components with TypeScript and Tailwind CSS"
    echo "✅ Comprehensive documentation and test scripts"
    echo ""
    echo "Ready to revolutionize backlink research! 🚀"
else
    echo "❌ Push failed. Check the error message above."
fi