import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import {Ionicons,} from '@expo/vector-icons'
import useTheme from '@/hooks/useTheme'
const TabsLayout = () => {
    const {colors} = useTheme();

  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                height: 90,
                paddingBottom: 20,
                paddingTop: 10,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
                paddingBottom: 50,
            },
            headerShown: false,
        }}
    >
        <Tabs.Screen
            name='index'
            options={{
                title:"Shelf",
                tabBarIcon: ({color,size}) => <Ionicons name='flash-outline' size={size} color={color}/>,
            }}
        />
        <Tabs.Screen
            name='account'
            options={{
                title:"Account",
                tabBarIcon: ({color,size}) => <Ionicons name='person-outline' size={size} color={color}/>,
            }}
        />

    </Tabs>
  )
}

export default TabsLayout