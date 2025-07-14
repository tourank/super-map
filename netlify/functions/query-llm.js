import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    const { query } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query is required' }),
      };
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that provides information about places and locations." }, 
        { role: "user", content: query }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 500,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ response: completion.choices[0].message.content }),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `OpenAI API error: ${error.message}` }),
    };
  }
};
