import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A1A12',
          borderTopColor: '#122318',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#52B788',
        tabBarInactiveTintColor: '#1B4332',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Feed' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore' }}
      />
      <Tabs.Screen
        name="plans"
        options={{ title: 'My Plans' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}