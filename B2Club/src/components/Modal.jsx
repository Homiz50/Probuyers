import React from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const Modal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 size={48} className="modal-icon success" />;
            case 'error': return <AlertCircle size={48} className="modal-icon error" />;
            case 'confirm': return <HelpCircle size={48} className="modal-icon confirm" />;
            default: return <AlertCircle size={48} className="modal-icon info" />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-body">
                    <div className="icon-wrapper">
                        {getIcon()}
                    </div>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>

                <div className="modal-footer">
                    {type === 'confirm' ? (
                        <>
                            <button className="btn-cancel" onClick={onClose}>{cancelText}</button>
                            <button className="btn-confirm" onClick={onConfirm}>{confirmText}</button>
                        </>
                    ) : (
                        <button className="btn-confirm" onClick={onClose}>OK</button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease-out;
                }
                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 400px;
                    position: relative;
                    padding: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .modal-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    color: var(--text-muted);
                    padding: 4px;
                    border-radius: 50%;
                    transition: 0.2s;
                }
                .modal-close:hover {
                    background: var(--bg-main);
                    color: var(--text-main);
                }
                .modal-body {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .icon-wrapper {
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: center;
                }
                .modal-icon.success { color: #22c55e; }
                .modal-icon.error { color: #ef4444; }
                .modal-icon.confirm { color: var(--primary); }
                .modal-icon.info { color: #3b82f6; }
                
                h2 {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 12px;
                }
                p {
                    color: var(--text-muted);
                    line-height: 1.6;
                    font-size: 15px;
                }
                .modal-footer {
                    display: flex;
                    gap: 12px;
                }
                .modal-footer button {
                    flex: 1;
                    padding: 12px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 15px;
                    transition: 0.2s;
                }
                .btn-cancel {
                    background: var(--bg-main);
                    color: var(--text-main);
                }
                .btn-cancel:hover { background: #e2e8f0; }
                .btn-confirm {
                    background: var(--primary);
                    color: white;
                }
                .btn-confirm:hover { background: #4f46e5; }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                @media (max-width: 480px) {
                    .modal-content {
                        padding: 24px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Modal;
