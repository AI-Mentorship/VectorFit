import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type SortOption = "lastClicked" | "seasonal" | "occasional";

export default function Wardrobe() {
  const { theme } = useTheme();
  const [selectedSort, setSelectedSort] = useState<SortOption>("lastClicked");
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastClickedOutfit, setLastClickedOutfit] = useState<number | null>(
    null
  );

  const sortOptions = [
    { value: "lastClicked", label: "Last Clicked On" },
    { value: "seasonal", label: "Seasonal Outfits" },
    { value: "occasional", label: "Occasional Outfits" },
  ];

  const handleOutfitClick = (outfitNumber: number) => {
    setLastClickedOutfit(outfitNumber);
  };

  const renderOutfitCard = (outfitNumber: number) => (
    <View key={outfitNumber} style={styles.outfitContainer}>
      <TouchableOpacity
        style={[
          styles.outfitCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor:
              lastClickedOutfit === outfitNumber
                ? theme.primary
                : theme.borderColor,
          },
          lastClickedOutfit === outfitNumber && {
            borderStyle: "solid",
            backgroundColor: theme.primary + "20",
          },
        ]}
        onPress={() => handleOutfitClick(outfitNumber)}
      >
        <View style={styles.placeholderContent}>
          <Ionicons
            name="shirt-outline"
            size={40}
            color={theme.secondaryText}
          />
          <Text
            style={[styles.placeholderText, { color: theme.secondaryText }]}
          >
            Add Outfit
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={[styles.outfitLabel, { color: theme.textColor }]}>
        Outfit {outfitNumber}
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header with Sort Dropdown */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>
          My Wardrobe
        </Text>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderColor,
              },
            ]}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text
              style={[styles.dropdownButtonText, { color: theme.textColor }]}
            >
              {
                sortOptions.find((option) => option.value === selectedSort)
                  ?.label
              }
            </Text>
            <Ionicons
              name={showDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.secondaryText}
            />
          </TouchableOpacity>

          {showDropdown && (
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                },
              ]}
            >
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    { borderBottomColor: theme.borderColor },
                    selectedSort === option.value && {
                      backgroundColor: theme.primary + "20",
                    },
                  ]}
                  onPress={() => {
                    setSelectedSort(option.value as SortOption);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      { color: theme.textColor },
                      selectedSort === option.value && {
                        color: theme.primary,
                        fontWeight: "500",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Outfit Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.outfitGrid}>
          {[1, 2, 3, 4, 5, 6].map(renderOutfitCard)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sortContainer: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  outfitContainer: {
    width: "48%",
    marginBottom: 25,
  },
  outfitCard: {
    aspectRatio: 0.8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  outfitLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
