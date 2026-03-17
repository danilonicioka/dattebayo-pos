import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useToastStore } from '@/store/toastStore';
import { scale, fontScale, verticalScale } from '@/utils/responsive';

export function GlobalToast() {
    const { showToast, message, type } = useToastStore();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (showToast) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -20,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showToast]);

    if (!showToast) {
        return null; // Optimização para quando invisível
    }

    return (
        <Animated.View
            style={[
                styles.globalToast,
                type === 'error' && styles.globalToastError,
                { opacity, transform: [{ translateY }] },
                showToast ? {} : { pointerEvents: 'none' }
            ]}
        >
            <Text style={styles.globalToastText}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    globalToast: {
        position: 'absolute',
        top: verticalScale(60),
        alignSelf: 'center',
        backgroundColor: '#059669', // Success green
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(24),
        borderRadius: scale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.15,
        shadowRadius: scale(4),
        elevation: 5,
        zIndex: 99999, // Alto o suficiente para ficar sobre qualquer modal/stack
    },
    globalToastError: {
        backgroundColor: '#EF4444', // Error red
    },
    globalToastText: {
        color: '#fff',
        fontSize: fontScale(14),
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
