import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react-native';
import { scale, fontScale, verticalScale } from '@/utils/responsive';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'success' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle size={scale(24)} color="#EF4444" />;
            case 'success': return <CheckCircle2 size={scale(24)} color="#10B981" />;
            case 'warning': return <AlertTriangle size={scale(24)} color="#F59E0B" />;
            case 'info': return <Info size={scale(24)} color="#3B82F6" />;
            default: return null;
        }
    };

    const getConfirmColor = () => {
        switch (type) {
            case 'danger': return '#EF4444';
            case 'success': return '#10B981';
            case 'warning': return '#F59E0B';
            case 'info': return '#3B82F6';
            default: return '#ee8b1b';
        }
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                        <X size={scale(20)} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        {getIcon()}
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: getConfirmColor() }]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(24),
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(10) },
        shadowOpacity: 0.1,
        shadowRadius: scale(15),
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: verticalScale(16),
        right: scale(16),
        padding: scale(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        marginBottom: verticalScale(12),
    },
    title: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: '#111827',
    },
    message: {
        fontSize: fontScale(15),
        color: '#4B5563',
        lineHeight: fontScale(22),
        marginBottom: verticalScale(24),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: scale(12),
    },
    cancelBtn: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        backgroundColor: '#F3F4F6',
        borderRadius: scale(8),
    },
    cancelText: {
        fontSize: fontScale(15),
        fontWeight: '600',
        color: '#4B5563',
    },
    confirmBtn: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        borderRadius: scale(8),
    },
    confirmText: {
        fontSize: fontScale(15),
        fontWeight: 'bold',
        color: '#fff',
    }
});
