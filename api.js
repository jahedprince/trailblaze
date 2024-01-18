import axios from "axios";

const createTravelItinerary = async (destination, duration, apiKey) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: `give me a detailed travel itinerary with multiple activities for each day from morning, afternoon, evening and night to ${destination} for ${duration} days. can you make sure to have different activites throughout the duration of the trip. also, please make sure the activites during each day are reasonable/doable taking into account travel time from one acitvity to another, and hours in a day with having to sleep and rest. If one of the days include a day trip, please take into account traveling to the day trip place and maybe consider staying and returning next day in morning`,
        max_tokens: 1200,
        temperature: 0.2,
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
