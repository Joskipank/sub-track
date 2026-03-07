import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabsParamList } from "../types/navigation";
import DashboardScreen from "../screens/DashboardScreen";
import SubscriptionsScreen from "../screens/SubscriptionsScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import ImportCsvScreen from "../screens/ImportCsvScreen";

const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator initialRouteName="Dashboard">
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ title: "Subscriptions" }}
      />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "Analytics" }} />
      <Tab.Screen name="ImportCsv" component={ImportCsvScreen} options={{ title: "Import CSV" }} />
    </Tab.Navigator>
  );
};

export default MainTabs;
