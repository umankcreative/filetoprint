import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
    pageTitle: string;
    currentUser: User;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setCurrentView: (view: string) => void;
    handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, currentUser, theme, toggleTheme, setCurrentView, handleLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
      <header className="bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700 shadow-sm h-20 flex items-center justify-between px-8 shrink-0">
          <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Application / <span className="text-gray-800 dark:text-slate-200 font-medium">{pageTitle}</span></p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-6">
              <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
                  <input type="text" placeholder="Search..." className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button
                  onClick={toggleTheme}
                  className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                  aria-label="Toggle dark mode"
              >
                  {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
              </button>
              <button className="relative text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
                  <Bell size={20}/>
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
               <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                         {currentUser.name.charAt(0)}
                     </div>
                     <span className="font-medium text-sm dark:text-slate-200">{currentUser.name}</span>
                     <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl z-10 py-2 animate-fade-in-up">
                          <button onClick={() => { setCurrentView('profile'); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600">
                              <UserIcon size={16} className="mr-3"/> Profile
                          </button>
                           <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                              <LogOut size={16} className="mr-3"/> Logout
                          </button>
                      </div>
                  )}
               </div>
          </div>
      </header>
    );
};

export default Header;
