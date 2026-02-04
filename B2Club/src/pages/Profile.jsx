import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LeadCard from '../components/LeadCard';
import { getCustomerProfile } from '../services/api';
import { User, Phone, Wallet, Calendar, FileText, ShoppingBag } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);
                const userId = user._id || user.id;

                const res = await getCustomerProfile(userId);
                if (res.data.success) {
                    setCustomer(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading-state">Loading profile...</div>;
    }

    return (
        <div className="dashboard-wrapper">
            <Header user={customer} />
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <div className="profile-grid">
                        <section className="profile-main-card">
                            <div className="profile-cover"></div>
                            <div className="profile-content">
                                <div className="profile-avatar-large">
                                    {customer?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </div>
                                <div className="profile-info-header">
                                    <h1>{customer?.name}</h1>
                                    {/* <p className="profile-status">Premium Customer</p> */}
                                </div>

                                <div className="info-stats-row">
                                    <div className="info-stat">
                                        <Wallet size={20} className="icon-purple" />
                                        <div>
                                            <span className="stat-label">Wallet Balance</span>
                                            <span className="stat-value">₹{customer?.credit || 0}</span>
                                        </div>
                                    </div>
                                    <div className="info-stat">
                                        <ShoppingBag size={20} className="icon-green" />
                                        <div>
                                            <span className="stat-label">Purchased Leads</span>
                                            <span className="stat-value">{customer?.purchasedLeads?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="info-stat">
                                        <Calendar size={20} className="icon-blue" />
                                        <div>
                                            <span className="stat-label">Joined On</span>
                                            <span className="stat-value">{formatDate(customer?.createdOn)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-details-list">
                                    <div className="detail-item">
                                        <div className="detail-icon"><Phone size={18} /></div>
                                        <div className="detail-text">
                                            <label>Phone Number</label>
                                            <p>{customer?.number}</p>
                                        </div>
                                    </div>
                                    {/* <div className="detail-item">
                                        <div className="detail-icon"><FileText size={18} /></div>
                                        <div className="detail-text">
                                            <label>Remark / Bio</label>
                                            <p>{customer?.remark || 'No remarks provided.'}</p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </section>

                        <section className="purchased-leads-section">
                            <div className="section-header">
                                <h2>Your Purchased Leads</h2>
                                <p>History of all leads you've acquired</p>
                            </div>

                            <div className="leads-list-mini">
                                {customer?.purchasedLeads?.length > 0 ? (
                                    customer.purchasedLeads.map(lead => (
                                        <LeadCard
                                            key={lead._id}
                                            lead={lead}
                                            isPurchased={true}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-leads">
                                        <p>You haven't purchased any leads yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            <style jsx>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .profile-main-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .profile-cover {
                    height: 120px;
                    background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
                }
                .profile-content {
                    padding: 0 32px 32px;
                    position: relative;
                }
                .profile-avatar-large {
                    width: 100px;
                    height: 100px;
                    background: #e0e7ff;
                    color: var(--primary);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 700;
                    margin-top: -50px;
                    border: 5px solid white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .profile-info-header {
                    margin-top: 16px;
                    margin-bottom: 24px;
                }
                .profile-info-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .profile-status {
                    color: var(--primary);
                    font-weight: 600;
                    font-size: 14px;
                    margin-top: 4px;
                }
                .info-stats-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 32px;
                    padding: 20px;
                    background: var(--bg-main);
                    border-radius: 16px;
                }
                .info-stat {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .stat-label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-value {
                    display: block;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .icon-purple { color: #a855f7; }
                .icon-green { color: #22c55e; }
                .icon-blue { color: #3b82f6; }

                .profile-details-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                }
                .detail-item {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                }
                .detail-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--primary-light);
                    color: var(--primary);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .detail-text label {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .detail-text p {
                    font-size: 16px;
                    color: var(--text-main);
                    font-weight: 500;
                    margin-top: 2px;
                }

                .section-header {
                    margin-bottom: 24px;
                }
                .section-header h2 {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .section-header p {
                    color: var(--text-muted);
                }
                .leads-list-mini {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }
                .empty-leads {
                    grid-column: 1 / -1;
                    padding: 40px;
                    text-align: center;
                    background: white;
                    border: 1px dashed var(--border-color);
                    border-radius: 16px;
                    color: var(--text-muted);
                }
                @media (max-width: 640px) {
                    .info-stats-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
