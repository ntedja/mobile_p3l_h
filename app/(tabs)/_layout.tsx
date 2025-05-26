import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="HomePage"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("./../../assets/images/i1.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="MerchandisePage"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("./../../assets/images/i2.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfilePage"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("./../../assets/images/i3.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
