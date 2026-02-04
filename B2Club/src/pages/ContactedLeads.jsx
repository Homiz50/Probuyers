import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LeadCard from '../components/LeadCard';
import { getCustomerProfile, saveLead } from '../services/api';
import { PhoneCall, Search } from 'lucide-react';

const ContactedLeads = () => {
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const userId = user._id || user.id;

            const res = await getCustomerProfile(userId);
            if (res.data.success) {
                setCustomer(res.data.data);
                localStorage.setItem('user', JSON.stringify(res.data.data));
            }
        } catch (err) {
            console.error("Error fetching contacted leads:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (leadId) => {
        if (!customer) return;
        const userId = customer._id || customer.id;
        try {
            const res = await saveLead({ customerId: userId, leadId });
            if (res.data.success) {
                fetchData();
            }
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    const purchasedLeads = customer?.purchasedLeads || [];

    const displayLeads = purchasedLeads.filter(lead => {
        const query = searchQuery.toLowerCase();
        return (
            lead.name?.toLowerCase().includes(query) ||
            lead.number?.toLowerCase().includes(query) ||
            lead.type?.toLowerCase().includes(query) ||
            lead.areas?.toLowerCase().includes(query) ||
            lead.subType?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div className="loading-state">Loading your contacted leads...</div>;
    }

    return (
        <div className="dashboard-wrapper">
            <Header user={customer} />
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <div className="page-header">
                        <div className="page-title">
                            <div className="icon-bg contacted">
                                <PhoneCall size={24} />
                            </div>
                            <div>
                                <h1>Contacted Leads</h1>
                                <p>Manage and contact your acquired customer leads</p>
                            </div>
                        </div>

                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, number or area..."
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
                                    isPurchased={true}
                                    isSaved={customer?.savedLeads?.some(sId => (sId?._id || sId?.id || sId)?.toString() === lead._id?.toString())}
                                    onSave={handleSave}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <PhoneCall size={48} />
                                </div>
                                <h3>No contacted leads yet</h3>
                                <p>Purchase leads from the marketplace to see them here.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

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
                .contacted { background: #ecfdf5; color: #10b981; }
                
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
                    padding: 40px;
                    text-align: center;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default ContactedLeads;
