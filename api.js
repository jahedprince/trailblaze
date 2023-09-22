import axios from "axios";

const createTravelItinerary = async (destination, duration, apiKey) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      {
        prompt: `give me a detailed travel itinerary with multiple activities for each day from morning, afternoon, evening and night to ${destination} for ${duration} days. can you make sure to have different activites throughout the duration of the trip. also, please make sure the activites during each day are reasonable/doable taking into account travel time from one acitvity to another, and hours in a day with having to sleep and rest. please add how many hours each activity should take at the end of each activity like (__ hrs). If one of the days are day trips, please take into account traveling to the day trip place`,
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
