const { GoogleGenAI, Type } = require('@google/genai');

// Initialize the client with API key from env
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Optional: Define function declaration (can be used later if needed)
const improveNoteFunctionDeclaration = {
  name: 'improve_note',
  description: 'Improves note content to be clearer and more professional',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: {
        type: Type.STRING,
        description: 'Original note content',
      },
      customPrompt: {
        type: Type.STRING,
        description: 'Custom prompt to override default prompt for note improvement',
      },
    },
    required: ['content'],
  },
};

exports.improveNote = async (req, res) => {
  try {
    const { content, customPrompt } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const defaultPrompt = `What you receive is a note, just update the grammar, spelling mistakes and make it better in everyway. Do not provide suggestions, just update the note and provide only the content:`;
    const prompt = `${customPrompt || defaultPrompt}\n\n${content}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 256,
      },
    });

    const improvedText =
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts[0].text;

    if (!improvedText) {
      return res.status(500).json({ message: 'No improved content returned' });
    }

    res.json({ improved: improvedText });
  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({ message: 'Error improving note', error: err.message });
  }
};
