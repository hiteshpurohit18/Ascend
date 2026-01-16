import { StyleSheet, Platform, Dimensions } from "react-native";
import { THEME } from "../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  contentArea: {
    flex: 1,
  },

  // --- Tab Bar ---
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingBottom: Platform.OS === "ios" ? 15 : 0, // minimal bottom padding for iOS home indicator
    paddingTop: 0,
    height: Platform.OS === "ios" ? 70 : 60, // Ultra compact
    alignItems: 'center', // Center icons vertically
    justifyContent: "space-around",
    elevation: 0, // Removed elevation for flat look (optional, but requested fade border)
    shadowOpacity: 0.2, // Removed shadow
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#999",
    fontWeight: "600",
  },

  // --- Home Screen ---
  homeHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10, // Reduced padding for Safe Area
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.text,
  },
  subGreeting: {
    fontSize: 14,
    color: THEME.textLight,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: "#FFE5E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  streakCount: {
    color: THEME.accent,
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
  },

  // --- Moods ---
  moodSection: {
    paddingVertical: 20,
  },
  moodItem: {
    width: 70,
    height: 90,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 12,
    color: THEME.textLight,
  },

  // --- Tools ---
  toolsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toolCard: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  toolText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: THEME.text,
  },

  // --- Audio Player ---
  playerCard: {
    backgroundColor: THEME.primary,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  playerIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  playerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  playPauseBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Video & Sounds ---
  videoContainer: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  ambientVideo: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  videoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  soundCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  soundImage: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    marginBottom: 10,
  },
  soundMeta: {
    alignItems: "center",
  },
  soundTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.text,
    textAlign: "center",
  },
  soundSub: {
    fontSize: 10,
    color: THEME.textLight,
  },
  activeSoundBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: THEME.primary,
    padding: 4,
    borderRadius: 10,
  },

  // --- Featured Blog ---
  featuredCard: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 5,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  featuredCategory: {
    color: THEME.warning,
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  featuredReadTime: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },

  // --- Quote Carousel ---
  quoteCarouselItem: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: THEME.secondary,
    borderRadius: 20,
    padding: 25,
    marginRight: 15,
    height: 180,
    justifyContent: "center",
    elevation: 4,
  },
  carouselText: {
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
    lineHeight: 26,
    textAlign: "center",
  },
  carouselAuthor: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "right",
    marginTop: 15,
    fontWeight: "bold",
  },
  carouselLikeBtn: {
    position: "absolute",
    bottom: 15,
    left: 15,
  },

  // --- Explore Screen ---
  screenContainer: {
    flex: 1,
  },
  exploreHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10, // Reduced padding for Safe Area
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: THEME.primary,
    marginBottom: 10,
  },
  subTitle: {
    color: THEME.textLight,
    fontSize: 14,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
  },
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 10,
    height: 36,
  },
  tagActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  tagText: {
    color: THEME.textLight,
    fontWeight: "600",
    fontSize: 12,
  },
  tagTextActive: {
    color: "#fff",
  },
  blogRowCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  blogRowImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  blogRowContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  blogRowCategory: {
    fontSize: 10,
    color: THEME.secondary,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  blogRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    marginVertical: 4,
  },
  blogRowMeta: {
    fontSize: 12,
    color: THEME.textLight,
  },

  // --- Favorites ---
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.textLight,
    marginTop: 10,
  },
  emptyStateSub: {
    fontSize: 14,
    color: "#ccc",
  },
  favQuoteCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  favQuoteIndicator: {
    width: 4,
    height: "100%",
    backgroundColor: THEME.accent,
    borderRadius: 2,
    marginRight: 15,
  },
  favQuoteText: {
    fontSize: 16,
    color: THEME.text,
    fontStyle: "italic",
    marginBottom: 8,
  },
  favQuoteAuthor: {
    fontSize: 12,
    color: THEME.textLight,
    fontWeight: "bold",
  },

  // --- Profile ---
  profileHeader: {
    alignItems: "center",
    padding: 30,
    paddingTop: 20, // Reduced padding for Safe Area
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: THEME.secondary,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.text,
  },
  profileTag: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 15,
  },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME.primary,
    borderRadius: 20,
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.text,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textLight,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: {
    fontSize: 16,
    color: THEME.text,
    marginLeft: 15,
  },

  // --- Utility ---
  sectionHeaderWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.text,
  },
  sectionHeaderAction: {
    fontSize: 14,
    color: THEME.secondary,
    fontWeight: "600",
  },
  iconBtn: {
    padding: 4,
  },

  // --- Modals ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  breathingContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: THEME.primary,
    borderRadius: 30,
    padding: 40,
    alignItems: "center",
  },
  breathingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 40,
  },
  breathingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  breathingSub: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  closeModalBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
  },

  // Blog Reader
  readerHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readerContent: {
    padding: 20,
    paddingBottom: 50,
  },
  readerCategory: {
    color: THEME.accent,
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 1,
  },
  readerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.text,
    marginBottom: 20,
    lineHeight: 34,
  },
  readerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.text,
  },
  publishDate: {
    fontSize: 12,
    color: THEME.textLight,
  },
  readerImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 25,
  },
  readerBody: {
    fontSize: 18,
    lineHeight: 30,
    color: "#444",
  },
  endMarker: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
});
