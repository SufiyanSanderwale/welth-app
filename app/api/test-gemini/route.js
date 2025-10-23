import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'No Gemini API key found',
        hasApiKey: false,
        message: 'Please set GEMINI_API_KEY in your environment variables'
      });
    }

    // Test Gemini API with a simple prompt
    const testPrompt = "Say 'Hello, Gemini API is working!' in English only.";
    
    console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: testPrompt }] }] })
    });
    
    console.log('Gemini test response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Gemini test error:', errorText);
      return NextResponse.json({ 
        error: `Gemini API error: ${response.status}`,
        hasApiKey: true,
        apiWorking: false,
        errorDetails: errorText
      });
    }
    
    const result = await response.json();
    console.log('Gemini test result:', result);
    
    const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text';
    
    return NextResponse.json({ 
      success: true,
      hasApiKey: true,
      apiWorking: true,
      response: responseText,
      resultStructure: Object.keys(result)
    });
    
  } catch (e) {
    console.error('Gemini Test Error:', e);
    return NextResponse.json({ 
      error: e.message,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      apiWorking: false,
      stack: e.stack
    }, { status: 500 });
  }
}
