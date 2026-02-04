import React, { useState, useEffect } from 'react';
import { MapPin, Home, Calendar, Phone, CheckCircle2, ShoppingCart, Lock, Bookmark } from 'lucide-react';

const LeadCard = ({ lead, isPurchased, isSaved, onPurchase, onSave, loading }) => {
    const handleSaveToggle = (e) => {
        e.stopPropagation();
        if (onSave) onSave(lead._id);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="lead-card">
            <div className="lead-card-header">
                <div className="header-left-chips">
                    <div className="lead-type-badge">
                        {lead.type}
                    </div>
                </div>
                <div className="header-actions">
                    <div className="lead-price-tag">
                        {lead.credit} Credits
                    </div>
                    <button
                        className={`save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={handleSaveToggle}
                        title={isSaved ? "Remove from saved" : "Save lead"}
                    >
                        <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            <div className="lead-info">
                <h3>{lead.bhk ? `${lead.bhk}` : ''} {lead.subType}</h3>

                <div className="info-item">
                    <MapPin size={16} />
                    <span>{lead.areas}</span>
                </div>

                <div className="info-item">
                    <Calendar size={16} />
                    <span>Shifting: {formatDate(lead.shiftingDate)}</span>
                </div>

                <div className="info-item">
                    <Home size={16} />
                    <span>{lead.occupancyType}</span>
                </div>

                {lead.priceRange && (
                    <div className="price-range">
                        ₹{lead.priceRange.min?.toLocaleString()} - ₹{lead.priceRange.max?.toLocaleString()}
                    </div>
                )}
            </div>

            <div className="lead-card-footer">
                {isPurchased ? (
                    <div className="purchased-info">
                        <div className="owner-info">
                            <CheckCircle2 size={16} color="var(--success-icon)" />
                            <span>{lead.name}</span>
                        </div>
                        <div className="phone-number">
                            <Phone size={16} />
                            <span>{lead.number}</span>
                        </div>
                    </div>
                ) : (
                    <div className="locked-footer">
                        <div className="hidden-number">
                            <Lock size={14} />
                            <span>Number Protected</span>
                        </div>
                        <button
                            className="purchase-btn"
                            onClick={() => onPurchase(lead._id)}
                            disabled={loading}
                        >
                            <ShoppingCart size={18} />
                            <span>Purchase Lead</span>
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .lead-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative;
                }
                .lead-card:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .lead-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .save-btn {
                    color: var(--text-muted);
                    padding: 6px;
                    border-radius: 8px;
                    transition: 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .save-btn:hover {
                    background: var(--bg-main);
                    color: var(--primary);
                }
                .save-btn.saved {
                    color: var(--primary);
                }
                .lead-type-badge {
                    background: var(--primary-light);
                    color: var(--primary);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .lead-price-tag {
                    color: #0d9488;
                    font-weight: 700;
                    font-size: 14px;
                }
                .lead-info h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 12px;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .price-range {
                    margin-top: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 15px;
                }
                .lead-card-footer {
                    margin-top: auto;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-color);
                }
                .purchased-info {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .owner-info, .phone-number {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .phone-number {
                    color: var(--primary);
                    background: var(--primary-light);
                    padding: 8px 12px;
                    border-radius: 8px;
                    justify-content: center;
                }
                .locked-footer {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .hidden-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-muted);
                }
                .purchase-btn {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    padding: 10px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 600;
                    transition: 0.2s;
                }
                .purchase-btn:hover:not(:disabled) {
                    background: #4f46e5;
                }
                .purchase-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .lead-card {
                        padding: 16px;
                    }
                    .lead-card-header {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: nowrap;
                    }
                    .header-actions {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 8px;
                        flex-shrink: 0;
                    }
                    .lead-price-tag {
                        font-size: 13px;
                        white-space: nowrap;
                    }
                    .lead-type-badge {
                        padding: 3px 8px;
                        font-size: 11px;
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default LeadCard;
