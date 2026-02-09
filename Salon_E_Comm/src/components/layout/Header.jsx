import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../services/apiService';
import { Search, ShoppingCart, User, Package, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCartTotal } = useCart();
  const { totalItems } = getCartTotal();
  const [searchValue, setSearchValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState(['Hair Care', 'Skin Care', 'Equipments', 'Tools', 'Deals']);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${searchValue}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-neutral-100">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-medium tracking-wider uppercase">
          <p className="animate-pulse">🎉 B2B EXCLUSIVE: UP TO 40% OFF FOR SALON OWNERS</p>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/become-seller" className="hover:text-blue-400 transition-colors">Become a Seller</Link>
            <Link to="/help" className="hover:text-blue-400 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-neutral-900/10">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-neutral-900 hidden sm:block">Salon<span className="text-blue-600">E</span>-Comm</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative group">
            <input
              type="text"
              placeholder="Search professional products..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-neutral-100 transition-colors">
              <Search size={18} className="text-neutral-500" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-5">
            {/* Mobile Search Toggle */}
            <button className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <Search size={22} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-2 transition-colors">Login</Link>
                <Link to="/signup" className="text-sm font-bold bg-neutral-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 transition-all shadow-md active:scale-95">Sign Up</Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 p-1.5 pr-3 bg-neutral-50 border border-neutral-100 rounded-full hover:bg-emerald-50 transition-colors">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
                      <User size={18} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-black text-neutral-700 hidden lg:block">{user.firstName}</span>
                    <ChevronDown size={14} className="text-neutral-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 mt-3 p-3 rounded-[32px] shadow-2xl border-neutral-100" align="end">
                  <DropdownMenuLabel className="px-4 py-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">{user.role}</span>
                      <span className="text-base font-black text-neutral-900 tracking-tight">{user.firstName} {user.lastName}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-50 h-px mx-2 mb-2" />
                  <DropdownMenuGroup className="space-y-1">
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild className="p-3 rounded-2xl cursor-pointer hover:bg-emerald-50 font-black group transition-all">
                        <Link to="/admin" className="flex items-center gap-4 w-full text-neutral-500 group-hover:text-emerald-700">
                          <div className="w-9 h-9 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 group-hover:border-emerald-100 group-hover:bg-white transition-all shadow-sm">
                            <Shield size={18} />
                          </div>
                          <span className="text-[10px] uppercase tracking-widest">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'AGENT' && (
                      <DropdownMenuItem asChild className="p-3 rounded-2xl cursor-pointer hover:bg-emerald-50 font-black group transition-all">
                        <Link to="/agent-dashboard" className="flex items-center gap-4 w-full text-neutral-500 group-hover:text-emerald-700">
                          <div className="w-9 h-9 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 group-hover:border-emerald-100 group-hover:bg-white transition-all shadow-sm">
                            <Zap size={18} />
                          </div>
                          <span className="text-[10px] uppercase tracking-widest">Agent Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="p-3 rounded-2xl cursor-pointer hover:bg-emerald-50 font-black group transition-all">
                      <Link to="/profile" className="flex items-center gap-4 w-full text-neutral-500 group-hover:text-emerald-700">
                        <div className="w-9 h-9 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 group-hover:border-emerald-100 group-hover:bg-white transition-all shadow-sm">
                          <User size={18} />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="p-3 rounded-2xl cursor-pointer hover:bg-emerald-50 font-black group transition-all">
                      <Link to="/my-orders" className="flex items-center gap-4 w-full text-neutral-500 group-hover:text-emerald-700">
                        <div className="w-9 h-9 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 group-hover:border-emerald-100 group-hover:bg-white transition-all shadow-sm">
                          <Package size={18} />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest">My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-neutral-50 h-px mx-2 mt-2 mb-2" />
                  <DropdownMenuItem className="p-3 rounded-2xl cursor-pointer hover:bg-red-50 group transition-all" onSelect={logout}>
                    <div className="flex items-center gap-4 w-full text-red-300 group-hover:text-red-600">
                      <div className="w-9 h-9 bg-red-50/50 rounded-xl flex items-center justify-center border border-red-50 group-hover:bg-white transition-all shadow-sm">
                        <LogOut size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation - Sub Header */}
      <nav className="hidden md:block border-t border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center gap-10 py-3.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(`/category/${cat.toLowerCase().replace(' ', '-')}`)}
                className="text-[13px] font-bold text-neutral-600 hover:text-blue-600 transition-all relative group"
              >
                {cat}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {
        isMenuOpen && (
          <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-6 absolute w-full shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    navigate(`/category/${cat.toLowerCase().replace(' ', '-')}`);
                    setIsMenuOpen(false);
                  }}
                  className="text-lg font-bold text-neutral-900 text-left border-b border-neutral-50 pb-2"
                >
                  {cat}
                </button>
              ))}
              {!user && (
                <div className="flex flex-col gap-3 mt-4">
                  <Link to="/login" className="w-full py-3 bg-neutral-100 text-neutral-900 font-bold rounded-xl text-center">Login</Link>
                  <Link to="/signup" className="w-full py-3 bg-neutral-900 text-white font-bold rounded-xl text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )
      }
    </header >
  );
}
