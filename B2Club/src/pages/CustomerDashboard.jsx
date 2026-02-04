import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ActionCard from '../components/ActionCard';
import { Sparkles, Users, ShoppingCart, Wallet, Search, TrendingUp } from 'lucide-react';
import { getCustomerProfile, getAllLeads } from '../services/api';

const CustomerDashboard = () => {
    const [loading, setLoading] = useState(true);

    // Initialize customer from localStorage so name shows up immediately
    const getInitialUser = () => {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    };

    const [data, setData] = useState({
        customer: getInitialUser(),
        leads: [],
        leadsAddedToday: 0,
        totalAvailableLeads: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = getInitialUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                // Handle both _id and id formats
                const userId = user._id || user.id;

                if (!userId) {
                    console.error("No user ID found in localStorage");
                    setLoading(false);
                    return;
                }

                // Fetch Parallelly with error handling for individual requests
                const [profileRes, leadsRes] = await Promise.all([
                    getCustomerProfile(userId).catch(err => ({ data: { success: false } })),
                    getAllLeads().catch(err => ({ data: { success: false, data: [] } }))
                ]);

                const newData = { ...data };


                if (leadsRes.data && leadsRes.data.success) {
                    const leads = leadsRes.data.data || [];
                    const totalCount = leadsRes.data.total || leads.length;

                    // Calculate leads added today
                    const now = new Date();
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    const addedToday = leads.filter(lead => {
                        const dateStr = lead.createdOn || lead.createdAt;
                        if (!dateStr) return false;
                        const leadDate = new Date(dateStr);
                        return leadDate >= startOfToday;
                    }).length;

                    newData.leads = leads;
                    newData.leadsAddedToday = addedToday;
                    newData.totalAvailableLeads = totalCount;
                }

                if (profileRes.data && profileRes.data.success && profileRes.data.data) {
                    newData.customer = profileRes.data.data;
                    // Update local user details in case credits or name changed
                    localStorage.setItem('user', JSON.stringify(profileRes.data.data));
                }

                setData(newData);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
                <p>Loading your dashboard...</p>
                <style jsx>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            color: var(--primary);
          }
          .loader {
            width: 40px;
            height: 40px;
            border: 4px solid var(--primary-light);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }


    const { customer, leads, leadsAddedToday, totalAvailableLeads } = data;

    return (
        <div className="dashboard-wrapper">
            <Header user={customer} />
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <div className="welcome-section">
                        <div className="welcome-text">
                            <h1>Welcome back, {customer?.name || 'User'}!</h1>
                            <p>Here's what's happening with your leads today</p>
                        </div>
                        <Link to="/leads-inbox">
                            <button className="view-leads-btn">
                                <span>View Leads</span>
                                <TrendingUp size={18} />
                            </button>
                        </Link>
                    </div>

                    <div className="stats-grid">
                        <StatsCard
                            title="Leads Added Today"
                            count={leadsAddedToday}
                            subtitle="Fresh leads available"
                            icon={<Sparkles size={22} />}
                            colorClass="yellow"
                        />
                        <StatsCard
                            title="Total Leads Available"
                            count={totalAvailableLeads}
                            subtitle="In the marketplace"
                            icon={<Users size={22} />}
                            colorClass="blue"
                        />
                        <StatsCard
                            title="Purchased Leads"
                            count={customer?.purchasedLeads?.length || 0}
                            subtitle="Your acquired leads"
                            icon={<ShoppingCart size={22} />}
                            colorClass="green"
                        />
                        <StatsCard
                            title="Wallet Balance"
                            count={`₹${customer?.credit || 0}`}
                            subtitle="Available to spend"
                            icon={<Wallet size={22} />}
                            colorClass="purple"
                        />
                    </div>

                    <div className="action-grid">
                        <Link to="/leads-inbox" style={{ display: 'flex', flex: 1 }}>
                            <ActionCard
                                title="Browse Leads"
                                subtitle="Explore and purchase new customer leads"
                                icon={<Search size={24} />}
                                colorClass="blue"
                            />
                        </Link>
                        <a
                            href="https://wa.me/919925750145?text=Hello,%20I%20want%20to%20recharge%20my%20B2Club%20wallet."
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', flex: 1, textDecoration: 'none' }}
                        >
                            <ActionCard
                                title="Recharge Wallet"
                                subtitle="Add funds to purchase more leads"
                                icon={<Wallet size={24} />}
                                colorClass="green"
                            />
                        </a>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerDashboard;
