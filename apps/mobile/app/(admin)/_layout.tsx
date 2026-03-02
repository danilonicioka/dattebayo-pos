import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ee8b1b', // Laranja
                tabBarInactiveTintColor: '#d4edda', // Verde Claro Inativo
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: '#223c0e', // Verde Fundo
                    borderTopWidth: 0,
                },
            }}>
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Gerenciamento',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    title: 'Caixa',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign.circle.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}
