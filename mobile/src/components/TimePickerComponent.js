import React from "react";
import { View } from "react-native";
import { Picker } from '@react-native-picker/picker';

import styles from "../styles/scheduleEventStyles";

export default function TimePickerComponent({ selectedTime, onTimeChange }) {
  const times = [
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];

  return (
    <View style={styles.pickerBox}>
      <Picker
        selectedValue={selectedTime}
        onValueChange={(itemValue) => onTimeChange(itemValue)}
      >
        <Picker.Item label="Select a time" value={null} />
        {times.map((time, index) => (
          <Picker.Item key={index} label={time} value={time} />
        ))}
      </Picker>
    </View>
  );
}
