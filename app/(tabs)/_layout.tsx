import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import {Ionicons,} from '@expo/vector-icons'
const TabsLayout = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor:"#2DBE7E",
            tabBarInactiveTintColor: "#8e97a3",
            tabBarStyle: {
                backgroundColor: "#fafafa",
                borderTopWidth: 1,
                borderTopColor: "yellow",
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