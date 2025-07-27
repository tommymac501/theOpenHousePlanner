import OpenAI from "openai";

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY
});

export async function extractTextFromImage(base64Image: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const imageData = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const response = await openai.chat.completions.create({
      model: "grok-2-vision-1212",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this real estate property listing image with extreme precision. Pay special attention to all dollar amounts and numbers. Focus on property details like address, price, monthly payment estimates (Est. $X,XXX/mo), dates, times, square footage, bedrooms, bathrooms, lot size, HOA fees, CDD fees, and any other relevant property information. Be very careful with numbers that start with 2 vs 1. Return only the extracted text without any formatting or interpretation."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageData}`
              }
            }
          ],
        },
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
}