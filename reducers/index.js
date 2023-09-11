// reducers/index.js
import { combineReducers } from "redux";
import itineraryReducer from "./itineraryReducer";

const rootReducer = combineReducers({
  itinerary: itineraryReducer,
  // Add more reducers here if needed
});

export default rootReducer;
