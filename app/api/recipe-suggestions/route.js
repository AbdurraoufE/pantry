import OpenAI from 'openai';

const openAIModel = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Invalid items!' }), { status: 400 });
    }

    const response = await openAIModel.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are the best chef in the world and know everything about food'},
        { role: 'user', content: `Generate a summarized recipe using the following items and display the ingredients as a list: ${items.join(', ')}. 
        Including a list of ingredients and brief instructions. Include a name part, a recipe ingredients used, 
        and the instructions to make the recipe. Add emojis to the recipe`}
      ],
      max_tokens: 250,
    });

    const recipe = response.choices[0].message.content.trim();
    return new Response(JSON.stringify({ recipe }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error generating!' }), { status: 500 });
  }
}