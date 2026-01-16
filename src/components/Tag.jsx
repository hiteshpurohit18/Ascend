import { Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/styles";
import { useTheme } from "../features/theme/theme.context";

const Tag = ({ text, active, onPress }) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tag, 
        { backgroundColor: theme.surface, borderColor: theme.divider },
        active && { backgroundColor: theme.primary, borderColor: theme.primary },
        !active && isDarkMode && { backgroundColor: 'rgba(255,255,255,0.1)' }
      ]}
    >
      <Text style={[
        styles.tagText, 
        { color: theme.textSecondary },
        active && { color: "#FFF" }
      ]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Tag;
