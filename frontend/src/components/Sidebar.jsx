import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Send, 
    History, 
    CreditCard, 
    Settings,
    UserCircle 
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    // Sidebar navigation items
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        // { name: 'Transfer Funds', icon: <Send size={20} />, path: '/transfer' },
        { name: 'Transaction History', icon: <History size={20} />, path: '/history' },
        // { name: 'My Accounts', icon: <CreditCard size={20} />, path: '/accounts' },
    ];

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
            {/* User Quick Info */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <UserCircle size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 truncate w-32">
                            {user?.name || "Guest User"}
                        </p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                            Personal Account
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section (Settings/Help) */}
            <div className="p-4 border-t border-slate-100">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                        }`
                    }
                >
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;