import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles";
import { THEME } from "../constants/theme";

const IconButton = ({ icon, color, size, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.iconBtn, style]}>
    <Ionicons name={icon} size={size || 24} color={color || THEME.text} />
  </TouchableOpacity>
);

export default IconButton;
