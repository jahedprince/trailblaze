import React from "react";
import { View, Text } from "react-native";

const ItineraryDayList = ({ itinerary }) => {
  return (
    <View>
      {itinerary.days.map((day, index) => (
        <View key={index}>
          <Text>{`Day ${day.dayNumber}:`}</Text>
          {day.activities.map((activity, activityIndex) => (
            <Text key={activityIndex}>{activity}</Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export default ItineraryDayList;
