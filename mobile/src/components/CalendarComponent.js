import React, { useState } from "react";
import { Calendar } from "react-native-calendars";

export default function CalendarComponent({ onDaySelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <Calendar
      onDayPress={(day) => {
        setSelected(day.dateString);
        onDaySelect(day.dateString);
      }}
      markedDates={{
        [selected]: {
          selected: true,
          selectedColor: "#8B0000",
          selectedTextColor: "white",
        },
      }}
      theme={{
        todayTextColor: "#8B0000",
        arrowColor: "#8B0000",
      }}
    />
  );
}
