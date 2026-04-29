import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Landmark, LogOut, LayoutDashboard, History, Send } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Redirect to login after successful logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="bg-slate-900 text-white shadow-md px-6 py-4 flex justify-between items-center">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <Landmark className="text-blue-400" />
                <span>SkyBank</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/dashboard" className="flex items-center gap-1 hover:text-blue-400 transition">
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </Link>
                        {/* <Link to="/transfer" className="flex items-center gap-1 hover:text-blue-400 transition">
                            <Send size={18} />
                            <span>Transfer</span>
                        </Link> */}
                        <Link to="/history" className="flex items-center gap-1 hover:text-blue-400 transition">
                            <History size={18} />
                            <span>History</span>
                        </Link>
                        
                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-4 ml-4 border-l border-slate-700 pl-4">
                            <span className="text-sm font-medium text-slate-300">
                                Hi, {user.name}
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition">
                            Open Account
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;