import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LeadCard from '../components/LeadCard';
import { getAllLeads, getCustomerProfile, purchaseLead, saveLead } from '../services/api';
import { Bookmark, Search } from 'lucide-react';
import Modal from '../components/Modal';

const SavedLeads = () => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [savedLeads, setSavedLeads] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
    const showModal = (config) => setModalConfig({ ...config, isOpen: true });

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const userId = user._id || user.id;

            const [leadsRes, profileRes] = await Promise.all([
                getAllLeads(),
                getCustomerProfile(userId)
            ]);

            if (leadsRes.data.success && profileRes.data.success) {
                const allLeads = leadsRes.data.data || [];
                const customerData = profileRes.data.data;
                const savedIds = customerData.savedLeads || [];

                // Robust filtering: handle both _id and id, and ensure string comparison
                const filteredSaved = allLeads.filter(lead => {
                    const leadId = (lead._id || lead.id)?.toString();
                    return savedIds.some(sId => {
                        const savedId = (sId._id || sId.id || sId)?.toString();
                        return savedId === leadId;
                    });
                });

                setSavedLeads(filteredSaved);
                setCustomer(customerData);
                localStorage.setItem('user', JSON.stringify(customerData));
            }
        } catch (err) {
            console.error("Error fetching saved leads:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePurchase = (leadId) => {
        if (!customer) return;

        showModal({
            type: 'confirm',
            title: 'Confirm Purchase',
            message: 'Are you sure you want to purchase this lead?',
            confirmText: 'Purchase Now',
            onConfirm: async () => {
                closeModal();
                setActionLoading(true);
                try {
                    const userId = customer._id || customer.id;
                    const res = await purchaseLead({ customerId: userId, leadId });
                    if (res.data.success) {
                        showModal({
                            type: 'success',
                            title: 'Success!',
                            message: 'Lead purchased successfully! You can now view the contact details.'
                        });
                        fetchData();
                    }
                } catch (err) {
                    showModal({
                        type: 'error',
                        title: 'Purchase Failed',
                        message: err.response?.data?.error || "Failed to purchase lead"
                    });
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleSave = async (leadId) => {
        if (!customer) return;
        const userId = customer._id || customer.id;

        try {
            const res = await saveLead({ customerId: userId, leadId });
            if (res.data.success) {
                fetchData(); // Refresh list after toggle
            }
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    const displayLeads = savedLeads.filter(lead => {
        const query = searchQuery.toLowerCase();
        return (
            lead.type?.toLowerCase().includes(query) ||
            lead.subType?.toLowerCase().includes(query) ||
            lead.areas?.toLowerCase().includes(query) ||
            lead.bhk?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div className="loading-state">Loading your saved leads...</div>;
    }

    return (
        <div className="dashboard-wrapper">
            <Header user={customer} />
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <div className="page-header">
                        <div className="page-title">
                            <div className="icon-bg saved">
                                <Bookmark size={24} />
                            </div>
                            <div>
                                <h1>Saved Leads</h1>
                                <p>Quickly access the leads you've bookmarked</p>
                            </div>
                        </div>

                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search saved leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="leads-grid">
                        {displayLeads.length > 0 ? (
                            displayLeads.map(lead => (
                                <LeadCard
                                    key={lead._id}
                                    lead={lead}
                                    isPurchased={customer?.purchasedLeads?.some(p => p === lead._id || p._id === lead._id)}
                                    isSaved={true} // They are in the saved list
                                    onPurchase={handlePurchase}
                                    onSave={handleSave}
                                    loading={actionLoading}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Bookmark size={48} />
                                </div>
                                <h3>No saved leads yet</h3>
                                <p>Browse the marketplace and save leads you're interested in.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
            />

            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    gap: 20px;
                }
                .page-title {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .icon-bg {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .saved { background: #fffbeb; color: #f59e0b; }
                
                .page-title h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .page-title p {
                    font-size: 14px;
                    color: var(--text-muted);
                }
                .search-bar {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .search-bar input {
                    width: 100%;
                    padding: 10px 10px 10px 40px;
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    background: white;
                    outline: none;
                }
                .leads-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }
                .empty-state {
                    grid-column: 1 / -1;
                    padding: 80px 40px;
                    text-align: center;
                    background: white;
                    border-radius: 20px;
                    border: 1px dashed var(--border-color);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .empty-icon {
                    color: var(--border-color);
                    margin-bottom: 8px;
                }
                .empty-state h3 {
                    color: var(--text-main);
                    font-size: 20px;
                    font-weight: 600;
                }
                .empty-state p {
                    color: var(--text-muted);
                    max-width: 300px;
                }
                .loading-state {
                    padding: 60px;
                    text-align: center;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default SavedLeads;
