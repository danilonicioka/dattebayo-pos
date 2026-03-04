import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

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
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle size={24} className="modal-icon text-red" />;
            case 'success': return <CheckCircle2 size={24} className="modal-icon text-green" />;
            case 'warning': return <AlertTriangle size={24} className="modal-icon text-yellow" />;
            case 'info': return <Info size={24} className="modal-icon text-blue" />;
            default: return null;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'danger': return 'btn-confirm-danger';
            case 'success': return 'btn-confirm-success';
            case 'warning': return 'btn-confirm-warning';
            case 'info': return 'btn-confirm-info';
            default: return 'btn-confirm-primary';
        }
    };

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content animate-fade-in-up">
                <button className="confirm-modal-close" onClick={onCancel}>
                    <X size={20} />
                </button>
                <div className="confirm-modal-header">
                    {getIcon()}
                    <h3>{title}</h3>
                </div>
                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-footer">
                    <button className="btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn-confirm ${getButtonClass()}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
