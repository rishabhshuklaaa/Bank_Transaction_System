import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Landmark, ShieldCheck, BarChart3, TrendingUp, Users ,BadgeCheck   } from 'lucide-react';

const Landing = () => {
    return (
        <div className="h-screen w-screen overflow-hidden relative font-sans bg-[#f8faff]">
            
            {/* FULL PAGE BACKGROUND IMAGE - FIXED */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=1920" 
                    alt="Premium Banking" 
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#f8faff]" />
            </div>

            {/* Navigation Header */}
            <nav className="relative z-20 flex items-center justify-between px-16 py-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                        <Landmark size={28} />
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-slate-900">SkyBank</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/login" className="text-sm font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
                        Login
                    </Link>
                    {/* Integrated pre-made class for consistent styling */}
                    <Link to="/register" className="btn-premium px-8 py-3.5 uppercase tracking-widest text-xs">
                        Open Account
                    </Link>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 px-16 h-[calc(100vh-120px)] flex items-center max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-24 items-center w-full">
                    
                    {/* Left: Content */}
                    <div className="space-y-7">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck size={16} />
                           Advanced Security Standards
                        </div>
                        <h1 className="text-8xl font-black text-slate-900 leading-[1] tracking-tight">
                            The future <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                                of Banking.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed max-w-md font-medium">
                            Experience secure real-time transfers, instant balance updates, and seamless money movement built for modern banking.
                        </p>
                        <Link to="/register" className="btn-premium flex items-center gap-4 w-fit px-10 py-6 rounded-[2rem] text-lg mt-4">
                            Start Banking
                            <ArrowRight size={24} />
                        </Link>
                    </div>

                    {/* Right: Data Visualization / Abstract Asset Management Image */}
                    <div className="relative flex items-center justify-center p-6">
                        {/* Abstract Asset Management Image - High end fintech look */}
                        <img 
                            src="https://images.pexels.com/photos/6771574/pexels-photo-6771574.jpeg?auto=compress&cs=tinysrgb&w=800" 
                            alt="Asset Management Visualization"
                            className="max-w-[480px] h-auto rounded-[3rem] shadow-[0_50px_100px_rgba(8,112,184,0.12)] border-8 border-white"
                        />
                        
                        {/* Static Premium Floating Glass Widget 1: Users */}
                        <div className="absolute -top-10 -left-10 glass-card p-6 flex items-center gap-5 border border-white/80">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <BadgeCheck    size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Consistency Rate</p>
                                <p className="text-3xl font-black text-slate-800">100%</p>
                            </div>
                        </div>

                        {/* Static Premium Floating Glass Widget 2: Total Features */}
                        <div className="absolute -bottom-10 -right-10 glass-container p-6 w-56 flex flex-col items-center text-center border-2 border-blue-50">
                            <ShieldCheck size={40} className="text-blue-600 mb-3" />
                            <p className="text-lg font-bold text-slate-900">Atomic Transactions</p>
                            <p className="text-xs font-medium text-slate-500">Race Condition Protection</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Landing;