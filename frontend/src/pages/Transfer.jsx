import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid
import API from '../api/axios';
import { Send, AlertCircle, CheckCircle2, Loader2, IndianRupee, ArrowRightLeft } from 'lucide-react';

const Transfer = () => {
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        transferType: 'OTHERS'
    });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    // Fetch user accounts to populate the "From" dropdown
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const { data } = await API.get('/accounts');
                if (data.success) setAccounts(data.accounts);
            } catch (err) {
                console.error("Failed to load accounts");
            }
        };
        fetchAccounts();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status.error || status.success) setStatus({ ...status, error: '', success: '' });
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.fromAccountId === formData.toAccountId && formData.transferType === 'OTHERS') {
            return setStatus({ ...status, error: "Source and destination accounts cannot be the same." });
        }

        setStatus({ ...status, loading: true, error: '', success: '' });

        try {
            // Generating a unique Idempotency Key for this transaction attempt
            const payload = {
                ...formData,
                idempotencyKey: uuidv4(), 
                amount: Number(formData.amount)
            };

            // Calling the 10-step atomic transaction flow
            const { data } = await API.post('/accounts/transfer', payload);

            if (data.success) {
                setStatus({ ...status, loading: false, success: "Transaction completed successfully!" });
                setFormData({ ...formData, amount: '', toAccountId: '' }); // Reset form
            }
        } catch (err) {
            setStatus({ 
                ...status, 
                loading: false, 
                error: err.response?.data?.message || "Transaction failed. Please try again." 
            });
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8 bg-slate-50 min-h-screen">
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-lg mb-2">
                    <Send size={28} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">Transfer Funds</h1>
                <p className="text-slate-500">Securely move money between accounts or to others.</p>
            </div>

            <form onSubmit={handleTransfer} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
                
                {/* Transaction Feedback */}
                {status.error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-center gap-3 text-red-700">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{status.error}</p>
                    </div>
                )}
                {status.success && (
                    <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-center gap-3 text-green-700">
                        <CheckCircle2 size={20} />
                        <p className="text-sm font-medium">{status.success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {/* From Account */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 text-transform: uppercase">Select Source Account</label>
                        <select 
                            name="fromAccountId"
                            required
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={formData.fromAccountId}
                            onChange={handleChange}
                        >
                            <option value="">-- Choose Account --</option>
                            {accounts.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.accountType} (**** {acc._id.slice(-4)}) - Balance: ₹{acc.balance}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center -my-4 relative z-10">
                        <div className="bg-white border border-slate-100 p-2 rounded-full shadow-md text-slate-400">
                            <ArrowRightLeft size={20} />
                        </div>
                    </div>

                    {/* To Account / Recipient */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 text-transform: uppercase">Recipient Account ID</label>
                        <input 
                            name="toAccountId"
                            type="text"
                            required
                            placeholder="Enter 24-character Account ID"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-mono text-sm"
                            value={formData.toAccountId}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 text-transform: uppercase">Amount (INR)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                name="amount"
                                type="number"
                                required
                                min="1"
                                className="w-full pl-12 pr-4 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-xl font-bold"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={status.loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {status.loading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Processing Transaction...
                        </>
                    ) : (
                        'Transfer Now'
                    )}
                </button>

                <p className="text-center text-xs text-slate-400">
                    Securely encrypted. This transaction is atomic and irreversible once completed.
                </p>
            </form>
        </div>
    );
};

export default Transfer;