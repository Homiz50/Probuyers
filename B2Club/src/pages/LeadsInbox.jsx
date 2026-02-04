import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LeadCard from '../components/LeadCard';
import { getFilteredLeads, getCustomerProfile, purchaseLead, saveLead } from '../services/api';
import { Inbox, Search, Filter, X, ChevronDown } from 'lucide-react';
import Modal from '../components/Modal';

const LeadsInbox = () => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showBhkDropdown, setShowBhkDropdown] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalLeads: 0,
        limit: 25
    });
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null
    });
    const bhkRef = useRef(null);

    // Filter State
    const [filters, setFilters] = useState({
        type: '',
        subType: '',
        bhk: [],
        areas: '',
        minPrice: '',
        maxPrice: '',
        occupancyType: '',
        startDate: '',
        endDate: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const userId = user._id || user.id;

            // Prepare params for the filter API
            const params = {
                type: filters.type || undefined,
                subType: filters.subType || undefined,
                bhk: filters.bhk.length > 0 ? filters.bhk.join(',') : undefined,
                areas: filters.areas || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                occupancyType: filters.occupancyType || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
                page: pagination.currentPage,
                limit: pagination.limit
            };

            const [leadsRes, profileRes] = await Promise.all([
                getFilteredLeads(params),
                getCustomerProfile(userId)
            ]);

            if (leadsRes.data.success) {
                setLeads(leadsRes.data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: leadsRes.data.pages || 1,
                    totalLeads: leadsRes.data.total || 0,
                    currentPage: leadsRes.data.currentPage || 1
                }));
            }
            if (profileRes.data.success) {
                setCustomer(profileRes.data.data);
                localStorage.setItem('user', JSON.stringify(profileRes.data.data));
            }
        } catch (err) {
            console.error("Error fetching inbox data:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bhkRef.current && !bhkRef.current.contains(event.target)) {
                setShowBhkDropdown(false);
            }
        };

        if (showBhkDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBhkDropdown]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
    };

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
    const showModal = (config) => setModalConfig({ ...config, isOpen: true });

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const toggleBhk = (value) => {
        setFilters(prev => {
            const bhk = [...prev.bhk];
            const index = bhk.indexOf(value);
            if (index > -1) {
                bhk.splice(index, 1);
            } else {
                bhk.push(value);
            }
            return { ...prev, bhk };
        });
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
    };

    const resetFilters = () => {
        setFilters({
            type: '',
            subType: '',
            bhk: [],
            areas: '',
            minPrice: '',
            maxPrice: '',
            occupancyType: '',
            startDate: '',
            endDate: ''
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePurchase = (leadId) => {
        if (!customer) return;

        showModal({
            type: 'confirm',
            title: 'Confirm Purchase',
            message: 'Are you sure you want to purchase this lead? Credits will be deducted from your wallet.',
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
                const profileRes = await getCustomerProfile(userId);
                if (profileRes.data.success) {
                    setCustomer(profileRes.data.data);
                    localStorage.setItem('user', JSON.stringify(profileRes.data.data));
                }
            }
        } catch (err) {
            console.error("Error saving lead:", err);
        }
    };

    // Client-side search on top of server-side filters for instant feel
    const displayLeads = leads; // Server-side handles search now with filters if needed, or keep it local
    // Note: Since we have server-side pagination, client-side filtering on the same array is tricky.
    // Ideally, the SearchBar should trigger a filter change that calls the API.

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // If you want search to be server-side, you'd add it to filters/params
    };

    return (
        <div className="dashboard-wrapper" style={{ overflowX: 'hidden' }}>
            <Header user={customer} />
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                    <div className="page-header">
                        <div className="page-title">
                            <div className="icon-bg inbox">
                                <Inbox size={24} />
                            </div>
                            <div>
                                <h1>Leads Inbox</h1>
                                <p>Browse and acquire exclusive customer leads</p>
                            </div>
                        </div>

                        <div className="header-actions">
                            <div className="search-bar">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Quick search areas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={18} />
                                <span>Filters</span>
                                {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== '') && <div className="filter-badge"></div>}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="filter-panel">
                            {/* <div className="filter-group">
                                    <label>Property Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        <option value="Residential Sell">Residential Sell</option>
                                        <option value="Residential Rent">Residential Rent</option>
                                        <option value="Commercial Sell">Commercial Sell</option>
                                        <option value="Commercial Rent">Commercial Rent</option>
                                    </select>
                                </div> */}

                            <div className="filter-group bhk-group" ref={bhkRef}>
                                <label>BHK</label>
                                <div className={`custom-select ${showBhkDropdown ? 'open' : ''}`} onClick={() => setShowBhkDropdown(!showBhkDropdown)}>
                                    <div className="select-trigger">
                                        <span>{filters.bhk.length > 0 ? filters.bhk.join(', ') : 'All BHK'}</span>
                                        <ChevronDown size={14} />
                                    </div>
                                    {showBhkDropdown && (
                                        <div className="select-options" onClick={(e) => e.stopPropagation()}>
                                            {['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '6BHK', '6+BHK'].map(opt => (
                                                <div
                                                    key={opt}
                                                    className={`option-item ${filters.bhk.includes(opt) ? 'selected' : ''}`}
                                                    onClick={() => toggleBhk(opt)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.bhk.includes(opt)}
                                                        readOnly
                                                    />
                                                    <span>{opt.replace('BHK', ' BHK')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Property Subtype</label>
                                <select
                                    value={filters.subType}
                                    onChange={(e) => handleFilterChange('subType', e.target.value)}
                                >
                                    <option value="">All Subtypes</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Bungalow">Bungalow</option>
                                    <option value="Tenement">Tenement</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Weekend Home">Weekend Home</option>
                                    <option value="Rowhouse">Rowhouse</option>
                                    <option value="Residential Plot">Residential Plot</option>
                                    <option value="PG">PG</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Price Range</label>
                                <div className="range-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Area</label>
                                <select
                                    value={filters.areas}
                                    onChange={(e) => handleFilterChange('areas', e.target.value)}
                                >
                                    <option value="">All Areas</option>
                                    <option value="Shela">Shela</option>
                                    <option value="SouthBopal">SouthBopal</option>
                                    <option value="Bopal">Bopal</option>
                                    <option value="Shilaj">Shilaj</option>
                                    <option value="Gota">Gota</option>
                                    <option value="Jagatpur">Jagatpur</option>
                                    <option value="GodrejGardenCity">Godrej Garden City</option>
                                    <option value="Tragad">Tragad</option>
                                    <option value="Zundal">Zundal</option>
                                    <option value="Motera">Motera</option>
                                    <option value="New CG Road">New CG Road</option>
                                    <option value="Vaishnodevi">Vaishnodevi</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>

                            <div className="filter-actions-row">
                                <button className="reset-btn" onClick={resetFilters}>Reset All</button>
                            </div>
                        </div>
                    )}

                    <div className="leads-grid">
                        {loading ? (
                            <div className="loading-placeholder">Fetching the best leads for you...</div>
                        ) : displayLeads.length > 0 ? (
                            displayLeads.map(lead => (
                                <LeadCard
                                    key={lead._id}
                                    lead={lead}
                                    isPurchased={customer?.purchasedLeads?.some(p => (p?._id || p)?.toString() === lead._id?.toString())}
                                    isSaved={customer?.savedLeads?.some(sId => (sId?._id || sId?.id || sId)?.toString() === lead._id?.toString())}
                                    onPurchase={handlePurchase}
                                    onSave={handleSave}
                                    loading={actionLoading}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No leads found matching your filters.</p>
                                <button onClick={resetFilters}>Clear Filters</button>
                            </div>
                        )}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                            >
                                Previous
                            </button>

                            <div className="page-numbers">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Show first, last, and current ± 2 pages
                                    const isMobile = window.innerWidth < 480;
                                    const siblingCount = isMobile ? 0 : 2; // Show fewer siblings on mobile

                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.totalPages ||
                                        (pageNum >= pagination.currentPage - siblingCount && pageNum <= pagination.currentPage + siblingCount)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-num ${pagination.currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === pagination.currentPage - 3 ||
                                        pageNum === pagination.currentPage + 3
                                    ) {
                                        return <span key={pageNum} className="pagination-dots">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                className="page-btn"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                {window.innerWidth < 480 ? '>' : 'Next'}
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <style jsx global>{`
                html, body, #root {
                    max-width: 100vw;
                    overflow-x: hidden;
                }
            `}</style>

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
                .header-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-shrink: 0;
                }
                .filter-toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    background: white;
                    font-weight: 600;
                    color: var(--text-main);
                    position: relative;
                }
                .filter-toggle-btn.active {
                    background: var(--primary-light);
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .filter-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 10px;
                    height: 10px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid white;
                }
                .filter-panel {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                    padding: 24px;
                    margin-bottom: 32px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                    animation: slideDown 0.2s ease-out;
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .filter-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .filter-group select, .filter-group input {
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    outline: none;
                }
                .bhk-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .bhk-options button {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    background: white;
                    font-size: 12px;
                    font-weight: 600;
                }
                .bhk-options button.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .custom-select {
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                }
                .select-trigger {
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    font-size: 14px;
                    min-height: 42px;
                }
                .select-options {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    margin-top: 4px;
                    z-index: 100;
                    max-height: 250px;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .option-item {
                    padding: 10px 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: 0.2s;
                }
                .option-item:hover {
                    background: #f8fafc;
                }
                .option-item.selected {
                    background: var(--primary-light);
                    color: var(--primary);
                }
                .option-item input {
                    cursor: pointer;
                    width: 16px;
                    height: 16px;
                }
                .range-inputs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .range-inputs input { width: 100%; }
                .filter-actions-row {
                    grid-column: 1 / -1;
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid var(--border-color);
                    padding-top: 16px;
                }
                .reset-btn {
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 14px;
                }
                .loading-placeholder {
                    grid-column: 1 / -1;
                    padding: 100px;
                    text-align: center;
                    color: var(--text-muted);
                    font-style: italic;
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    gap: 20px;
                    width: 100%;
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
                .inbox { background: var(--info-bg); color: var(--info-icon); }
                .page-title h1 { font-size: 24px; font-weight: 700; color: var(--text-main); }
                .page-title p { font-size: 14px; color: var(--text-muted); }
                .search-bar { position: relative; width: 100%; max-width: 300px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .search-bar input { width: 100%; padding: 10px 10px 10px 40px; border: 1px solid var(--border-color); border-radius: 10px; background: white; outline: none; transition: 0.2s; }
                .search-bar input:focus { border-color: var(--primary); }
                .leads-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 24px; }
                .empty-state { grid-column: 1 / -1; background: white; border-radius: 16px; border: 1px dashed var(--border-color); padding: 60px; text-align: center; }
                .empty-state button { margin-top: 12px; color: var(--primary); font-weight: 600; }

                /* Pagination Styles */
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 40px;
                    padding-bottom: 40px;
                }
                .page-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: white;
                    font-weight: 600;
                    color: var(--text-main);
                    transition: 0.2s;
                }
                .page-btn:hover:not(:disabled) {
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .page-numbers {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .page-num {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: white;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-main);
                    transition: 0.2s;
                }
                .page-num:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .page-num.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .pagination-dots {
                    color: var(--text-muted);
                    font-weight: 600;
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    
                    .header-actions {
                        width: 100%;
                        flex-direction: row;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .search-bar {
                        max-width: none;
                        flex: 1;
                    }
                    
                    .filter-toggle-btn {
                        width: auto;
                        padding: 10px;
                        justify-content: center;
                    }
                    
                    .filter-toggle-btn span {
                        display: none;
                    }
                    
                    .filter-panel {
                        grid-template-columns: 1fr;
                        padding: 16px;
                        gap: 16px;
                    }
                    
                    .filter-actions-row {
                        justify-content: center;
                    }

                    .pagination {
                        gap: 8px;
                        padding-bottom: 24px;
                    }
                    
                    .page-btn {
                        padding: 8px 12px;
                        font-size: 13px;
                    }
                    
                    .page-num {
                        width: 32px;
                        height: 32px;
                        font-size: 13px;
                    }
                }

                @media (max-width: 480px) {
                    .page-numbers {
                        gap: 4px;
                    }
                    
                    .page-num {
                        width: 28px;
                        height: 28px;
                    }

                    .page-title h1 {
                        font-size: 20px;
                    }
                    
                    .icon-bg {
                        width: 40px;
                        height: 40px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LeadsInbox;
