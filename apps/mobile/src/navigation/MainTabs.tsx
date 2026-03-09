import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabsParamList } from "../types/navigation";
import DashboardScreen from "../screens/DashboardScreen";
import SubscriptionsScreen from "../screens/SubscriptionsScreen";
import UpcomingScreen from "../screens/UpcomingScreen";
import RemindersScreen from "../screens/RemindersScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import ImportScreen from "../screens/ImportScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useI18n } from "../context/SettingsContext";

const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs = () => {
  const { tr } = useI18n();

  return (
    <Tab.Navigator initialRouteName="Dashboard">
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: tr("tabDashboard") }} />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ title: tr("tabSubscriptions") }}
      />
      <Tab.Screen name="Upcoming" component={UpcomingScreen} options={{ title: tr("tabUpcoming") }} />
      <Tab.Screen name="Reminders" component={RemindersScreen} options={{ title: tr("tabReminders") }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: tr("tabAnalytics") }} />
      <Tab.Screen name="Import" component={ImportScreen} options={{ title: "Import" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: tr("tabSettings") }} />
    </Tab.Navigator>
  );
};

export default MainTabs;
