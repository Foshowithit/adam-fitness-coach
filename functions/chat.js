const fetch = require('node-fetch');

// Function to build assessment context from new format
function buildAssessmentContext(assessmentData) {
    if (!assessmentData) return '';
    
    const contextParts = [];
    
    // Map assessment values to descriptions
    const goalMap = {
        'muscle': 'build muscle and strength',
        'fat-loss': 'lose fat and get lean', 
        'performance': 'improve athletic performance',
        'recomp': 'body recomposition (build muscle while losing fat)'
    };
    
    const experienceMap = {
        'beginner': 'beginner (0-1 years training)',
        'intermediate': 'intermediate (1-3 years training)', 
        'advanced': 'advanced (3+ years training)'
    };
    
    const equipmentMap = {
        'full-gym': 'full commercial gym access',
        'home-gym': 'home gym setup',
        'minimal': 'minimal equipment (dumbbells, bands)',
        'bodyweight': 'bodyweight training only'
    };
    
    // Build context from new assessment format
    if (assessmentData.q1) {
        const goal = goalMap[assessmentData.q1] || assessmentData.q1;
        contextParts.push(`Primary goal: ${goal}`);
    }
    
    if (assessmentData.q2) {
        const exp = experienceMap[assessmentData.q2] || assessmentData.q2;
        contextParts.push(`Experience level: ${exp}`);
    }
    
    if (assessmentData.q3) {
        contextParts.push(`Training frequency: ${assessmentData.q3} days per week`);
    }
    
    if (assessmentData.q4) {
        const equip = equipmentMap[assessmentData.q4] || assessmentData.q4;
        contextParts.push(`Equipment access: ${equip}`);
    }
    
    if (assessmentData.q5 && assessmentData.q5.trim()) {
        contextParts.push(`Additional details: ${assessmentData.q5}`);
    }
    
    if (contextParts.length) {
        return `

PERSONALIZED CONTEXT FOR THIS USER:
${contextParts.map(part => `- ${part}`).join('\n')}

Tailor your responses to their specific situation, goals, and experience level.
        `;
    }
    
    return '';
}

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'Missing Gemini API key',
                    instructions: 'Please set GEMINI_API_KEY environment variable'
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        const { message, chatHistory, assessmentData } = JSON.parse(event.body);

        // Build assessment context
        const assessmentContext = buildAssessmentContext(assessmentData);

        const systemPrompt = `You are Adam, a Pro bodybuilder and performance coach speaking to fitness enthusiasts.

IMPORTANT: All advice is for research and entertainment purposes only. Always recommend consulting healthcare professionals.

Your expertise combines scientific knowledge with practical bodybuilding experience from years of training and coaching others.

Core principles:
- Evidence-based approach (research + practical experience)
- Conservative risk assessment (safety first)
- Systematic progression (start minimal, scale with evidence)
- Scientific precision (treat decisions seriously)
- Proper monitoring (track metrics and progress)
- Safety first (healthcare supervision recommended)
- Experience matters - practical application with theory

Your personality is direct and no-nonsense like a seasoned professional. You cut through marketing BS with scientific facts and practical advice based on real experience. You are conservative but knowledgeable about performance enhancement when done safely. Always emphasize proper monitoring and healthcare professional supervision.

Provide specific, actionable advice based on proven methods and experience. Keep responses concise but informative.

${assessmentContext}`;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemPrompt },
                        { text: `User message: ${message}` }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
                candidateCount: 1
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API request failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };

    } catch (error) {
        console.error('Function error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};