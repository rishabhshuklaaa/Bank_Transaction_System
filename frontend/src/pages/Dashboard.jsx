import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Wallet, ArrowUpRight, RefreshCcw, IndianRupee, Plus, Send, CheckCircle2, X, Fingerprint, Calendar, Loader2, Trash2, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState({ accounts: [], recentTransactions: [] });
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalType, setModalType] = useState(null); // 'SELF', 'EXTERNAL', 'DELETE'
    const [amount, setAmount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await API.get('/accounts/'); 
            if (response.data.success) {
                setData(prev => ({ ...prev, accounts: response.data.accounts }));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const triggerSuccess = (message = "Action Processed Successfully!") => {
        setShowSuccess(message);
        setModalType(null);
        setAmount('');
        setToAccount('');
        fetchDashboardData();
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const openNewAccount = async () => {
        try {
            const response = await API.post('/accounts/create', { 
                accountType: 'SAVINGS', 
                balance: 500 
            });
            if(response.data.success) {
                triggerSuccess("Vault Initialized with ₹500");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to initialize account");
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const fromId = data.accounts[0]._id;
            const targetId = modalType === 'SELF' ? fromId : toAccount;

            const response = await API.post('/accounts/transfer', {
                fromAccountId: fromId,
                toAccountId: targetId,
                amount: Number(amount),
                transferType: modalType === 'SELF' ? 'SELF' : 'OTHERS'
            });

            if (response.data.success) {
                triggerSuccess();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Transaction Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // NEW: Delete Account Logic
    const handleDeleteAccount = async () => {
        setIsProcessing(true);
        try {
            const accountId = data.accounts[0]._id;
            // Aapka backend status update (CLOSED) handle karega
            const response = await API.delete(`/accounts/${accountId}`);
            if (response.data.success) {
                triggerSuccess("Account Closed Successfully");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Cannot close account with pending balance");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading && !data.accounts.length) {
        return <div className="h-screen flex items-center justify-center text-blue-600 font-black animate-pulse uppercase tracking-[0.3em]">Syncing Vault...</div>;
    }

    return (
        <div className="p-8 space-y-10 min-h-screen relative bg-[#f8faff]">
            
            {showSuccess && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top">
                    <CheckCircle2 className="text-green-400" size={28} />
                    <span className="font-bold tracking-tight">{showSuccess}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Vault.</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Active Session: {user?.name}</p>
                </div>
                <button onClick={fetchDashboardData} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:rotate-180 transition-transform duration-700">
                    <RefreshCcw size={20} className="text-slate-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Side */}
                <div className="lg:col-span-7 space-y-8">
                    {data.accounts.length > 0 ? (
                        data.accounts.map((acc) => (
                            <div key={acc._id} className="glass-card p-10 space-y-8 border-2 border-white relative overflow-hidden group">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Net Worth</p>
                                        <h2 className="text-6xl font-black text-slate-900 tracking-tighter flex items-center">
                                            <IndianRupee size={40} strokeWidth={3} />
                                            {acc.balance.toLocaleString('en-IN')}
                                        </h2>
                                    </div>
                                    <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {acc.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Fingerprint size={14} />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vault ID</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">{acc._id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Opened On</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">{new Date(acc.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card p-16 flex flex-col items-center text-center space-y-8 border-dashed border-4 border-white">
                            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600">
                                <Wallet size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Active Vault.</h3>
                            <button onClick={openNewAccount} className="btn-premium px-12 py-5 text-sm uppercase tracking-widest">
                                Initialize with ₹500
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Terminal */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-4 shadow-2xl">
                        <h3 className="text-xl font-black uppercase tracking-tight">Terminal.</h3>
                        <div className="space-y-4">
                            <button onClick={() => setModalType('EXTERNAL')} className="flex items-center justify-between w-full p-6 bg-white/10 rounded-[1.5rem] hover:bg-white/20 transition-all group">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-blue-500 rounded-xl"><Send size={20} /></div>
                                    <span className="font-bold">Send Money</span>
                                </div>
                                <ArrowUpRight className="opacity-0 group-hover:opacity-100" />
                            </button>

                            <button onClick={() => setModalType('SELF')} className="flex items-center justify-between w-full p-6 bg-white/10 rounded-[1.5rem] hover:bg-white/20 transition-all group">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-indigo-500 rounded-xl"><Plus size={20} /></div>
                                    <span className="font-bold">Self Deposit</span>
                                </div>
                                <ArrowUpRight className="opacity-0 group-hover:opacity-100" />
                            </button>

                            {data.accounts.length > 0 && (
                                <button onClick={() => setModalType('DELETE')} className="flex items-center justify-between w-full p-6 bg-red-500/10 rounded-[1.5rem] hover:bg-red-500/20 transition-all group">
                                    <div className="flex items-center gap-4 text-red-400">
                                        <div className="p-3 bg-red-500/20 rounded-xl"><Trash2 size={20} /></div>
                                        <span className="font-bold">Close Vault</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {modalType && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="glass-card max-w-md w-full p-10 relative bg-white border-none shadow-2xl">
                        <button onClick={() => setModalType(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={24} />
                        </button>
                        
                        {modalType === 'DELETE' ? (
                            <div className="space-y-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                                    <AlertTriangle size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">Are you sure?</h2>
                                    <p className="text-slate-500 text-sm">Closing your vault is permanent. You will lose access to this Account ID.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setModalType(null)} className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                                    <button onClick={handleDeleteAccount} disabled={isProcessing} className="flex-1 px-6 py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
                                        {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : "Close Vault"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleTransaction} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{modalType === 'SELF' ? 'Add Funds' : 'Transfer'}</h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1">{modalType === 'SELF' ? 'Direct deposit into your vault.' : 'Send funds to another account ID.'}</p>
                                </div>

                                <div className="space-y-4">
                                    {modalType === 'EXTERNAL' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Recipient Account ID</label>
                                            <input required className="input-premium font-mono text-xs" placeholder="MongoDB _id" value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Amount (INR)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input type="number" required className="input-premium pl-12 font-bold text-xl" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={isProcessing} className="btn-premium w-full py-5 flex items-center justify-center gap-3">
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Confirm <ArrowUpRight size={20} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;