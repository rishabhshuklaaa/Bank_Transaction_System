import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Landmark, Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-blue-100 perspective-1000">
            {/* 3D Wrapper Card */}
            <div className="max-w-5xl w-full h-full max-h-[700px] glass-container flex overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] transform rotate-x-2 transition-transform duration-700 hover:rotate-x-0">
                
                {/* Left Side: Premium Image Panel (Matches Register) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
                    <img 
                        src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                        alt="Security" 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 scale-110 hover:scale-100 transition-transform duration-1000"
                    />
                    <div className="relative z-10 p-12 flex flex-col justify-between text-white">
                        <div className="flex items-center gap-2 mb-8">
                            <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-all">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md group-hover:bg-blue-500/20 transition-colors">
                                <Landmark size={28} className="text-white lg:text-white text-blue-600 lg:group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white lg:text-white text-slate-900">
                             SkyBank
                            </span>
                            </Link>
                        </div>
                        
                        <div className="space-y-6">
                            <h2 className="text-5xl font-black leading-tight tracking-tight">
                                Secure your <br />
                                <span className="text-blue-400">Digital Vault.</span>
                            </h2>
                            <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
                                Log in to experience industry-leading security and lightning-fast transactions.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs opacity-50 uppercase tracking-widest font-black">
                            <span className="w-8 h-px bg-white/30"></span>
                            Encrypted Session
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center bg-white/40">
                    <div className="max-w-md mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right duration-700">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                            <p className="text-slate-500 font-medium mt-2">Enter your credentials to continue.</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                                <AlertCircle className="text-red-500" size={20} />
                                <p className="text-sm text-red-600 font-bold">{error}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input
                                            name="email" type="email" required className="input-premium pl-12"
                                            placeholder="name@example.com" value={formData.email} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                                        <a href="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot?</a>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input
                                            name="password" type="password" required className="input-premium pl-12"
                                            placeholder="••••••••" value={formData.password} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSubmitting}
                                className="btn-premium w-full py-4 text-md flex items-center justify-center gap-2 shadow-2xl shadow-blue-600/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>Secure Login <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>

                        <div className="pt-4 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-black text-blue-600 hover:underline">
                                    Create One
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;