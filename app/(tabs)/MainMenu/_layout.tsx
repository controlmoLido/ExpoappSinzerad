import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Control showing/hiding settings tab
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      
      

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            ...Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          },
        }}
      >
        

       
      </Tabs>
    </>
  );
}
