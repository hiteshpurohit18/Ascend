import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { MoodProvider } from "../features/mood/mood.context";
import { QuotesProvider } from "../features/quotes/quotes.context";
import { BlogsProvider } from "../features/blogs/blogs.context";
import { AuthProvider } from "../features/auth/auth.context";
import { NavigationProvider } from "../features/navigation/navigation.context";
import { HydrationProvider } from "../features/hydration/hydration.context";
import { JournalProvider } from "../features/journal/journal.context";
import { SleepProvider } from "../features/sleep/sleep.context";
import { ThemeProvider } from "../features/theme/theme.context";

import { GrowthProvider } from "../features/growth/growth.context";
import { PeriodProvider } from "../features/period/period.context";

export const AppProviders = ({ children }) => {
  return (
    <ActionSheetProvider>
      <AuthProvider>
        <NavigationProvider>
          <MoodProvider>
            <QuotesProvider>
              <BlogsProvider>
                <JournalProvider>
                  <HydrationProvider>
                    <SleepProvider>
                      <GrowthProvider>
                        <PeriodProvider>
                          <ThemeProvider>
                           {children}
                          </ThemeProvider>
                        </PeriodProvider>
                      </GrowthProvider>
                    </SleepProvider>
                  </HydrationProvider>
                </JournalProvider>
              </BlogsProvider>
            </QuotesProvider>
          </MoodProvider>
        </NavigationProvider>
      </AuthProvider>
    </ActionSheetProvider>
  );
};
