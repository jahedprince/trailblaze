import axios from "axios";

const createTravelItinerary = async (destination, duration, apiKey) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      {
        prompt: `give me a travel itinerary for ${destination} for ${duration} days`,
        max_tokens: 1200,
        temperature: 0.2,
        n: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error) {
    throw error;
  }
};

export default createTravelItinerary;
