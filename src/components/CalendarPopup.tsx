import { Calendar, DateData } from 'react-native-calendars';
import { Overlay, useTheme } from '@rneui/themed';

type CalendarPopupProps = {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
};

export default function CalendarPopup({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
}: CalendarPopupProps) {
  const { theme } = useTheme();

  const selectedDateString = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0'),
  ].join('-');

  const handleDayPress = (day: DateData) => {
    const date = new Date(day.year, day.month - 1, day.day);
    onDateSelect(date);
    onClose();
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      animationType="fade"
      overlayStyle={{
        borderRadius: 12,
        padding: 8,
        width: '90%',
        backgroundColor: theme.colors.background,
      }}
    >
      <Calendar
        current={selectedDateString}
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDateString]: { selected: true },
        }}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.text,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          monthTextColor: theme.colors.text,
          arrowColor: theme.colors.primary,
          textDisabledColor: theme.colors.sliderTrack,
        }}
      />
    </Overlay>
  );
}
