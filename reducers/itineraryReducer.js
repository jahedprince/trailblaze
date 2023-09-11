// reducers/itineraryReducer.js
const initialState = {
  itineraries: [],
};

const itineraryReducer = (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_ITINERARY":
      return { ...state, itineraries: [...state.itineraries, action.payload] };
    default:
      return state;
  }
};

export default itineraryReducer;
