import OpenAI from "openai";
import { API_RESPONSES } from '../../src/constants/index.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return API_RESPONSES.error('OpenAI API key not configured');
    }

    if (!event.body) {
      return API_RESPONSES.error('Request body is required', 400);
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      return API_RESPONSES.error('Invalid JSON in request body', 400);
    }

    const { query } = parsedBody;

    if (!query) {
      return API_RESPONSES.error('Query is required', 400);
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that provides information about places and locations." }, 
        { role: "user", content: query }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 500,
    });

    return API_RESPONSES.success({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return API_RESPONSES.error(`OpenAI API error: ${error.message}`);
  }
};
