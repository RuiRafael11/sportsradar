import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import { colors } from "../theme";

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
          selectedColor: colors.primary,
          selectedTextColor: "white",
        },
      }}
      theme={{
        calendarBackground: colors.surface,
        selectedDayBackgroundColor: colors.primary,
        todayTextColor: colors.primary,
        arrowColor: colors.primary,
        textDayFontWeight: "600",
        textMonthFontWeight: "800",
      }}
    />
  );
}
