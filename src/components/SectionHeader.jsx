import { View, Text, TouchableOpacity } from "react-native";
import { styles as globalStyles } from "../styles/styles";
import { useTheme } from "../features/theme/theme.context";

const SectionHeader = ({ title, onAction, actionText }) => {
  const { theme } = useTheme();

  return (
    <View style={globalStyles.sectionHeaderWrapper}>
      <Text style={[globalStyles.sectionHeaderTitle, { color: theme.text }]}>{title}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[globalStyles.sectionHeaderAction, { color: theme.primary }]}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;
