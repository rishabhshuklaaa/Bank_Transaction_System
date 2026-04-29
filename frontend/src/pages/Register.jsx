import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Landmark, User, Mail, Lock, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }
        if (formData.password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        setIsSubmitting(true);
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password
        });
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-blue-100">
            {/* Main Auth Card */}
            <div className="max-w-5xl w-full h-full glass-container flex overflow-hidden shadow-2xl shadow-blue-900/10 animate-in fade-in zoom-in duration-500">
                
                {/* Left Side: Premium Image Panel */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden">
                    <img 
                        src="https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                        alt="Join SkyBank" 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 scale-110 hover:scale-100 transition-transform duration-700"
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
                                Start your <br />
                                <span className="text-blue-400">Wealth Journey</span> today.
                            </h2>
                            <p className="text-indigo-100/80 text-lg font-medium leading-relaxed">
                                Join our global community of smart investors and experience borderless digital banking.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm font-bold text-indigo-200 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit">
                                <CheckCircle2 size={18} className="text-blue-400" />
                                Instant Account Setup
                            </div>
                            <div className="flex items-center gap-2 text-xs opacity-50 uppercase tracking-widest font-black">
                                <span className="w-8 h-px bg-white/30"></span>
                                Secure & Encrypted
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center bg-white/40 overflow-y-auto">
                    <div className="max-w-md mx-auto w-full space-y-8 py-6">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
                            <p className="text-slate-500 font-medium mt-2">Open your digital vault in minutes.</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                                <AlertCircle className="text-red-500" size={20} />
                                <p className="text-sm text-red-600 font-bold">{error}</p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input
                                            name="name" type="text" required className="input-premium pl-12"
                                            placeholder="Rishabh Shukla" value={formData.name} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
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

                                {/* Password Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input
                                                name="password" type="password" required className="input-premium pl-12"
                                                placeholder="••••••••" value={formData.password} onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                                        <div className="relative group">
                                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input
                                                name="confirmPassword" type="password" required className="input-premium pl-12"
                                                placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSubmitting}
                                className="btn-premium w-full py-4 text-md flex items-center justify-center gap-2 mt-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Get Started <ArrowRight size={18} /></>}
                            </button>
                        </form>

                        <div className="pt-4 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Already have an account? <Link to="/login" className="font-black text-blue-600 hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;