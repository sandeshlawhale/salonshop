import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, User, Package, LogOut, ChevronDown, Menu, X, Shield, Bell, Zap, ChevronRight } from 'lucide-react';
import { categoryAPI } from '../../utils/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from '../ui/button';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCartTotal } = useCart();
  const { totalItems } = getCartTotal();
  const [searchValue, setSearchValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryAPI.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const parentCategories = categories.filter(c => !c.parent);
  const getChildren = (parentId) => categories.filter(c => c.parent === parentId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${searchValue}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-sm font-sans">
      <div className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 md:h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-green-950/90 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-neutral-900/10">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-green-950/90 hidden sm:block">
              Salon<span className="text-emerald-500">E</span>-Comm
            </span>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">

            <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <Link to="/cart" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors group">
              <ShoppingCart size={20} className="group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="block">
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900">Login</Link>
                  <Link to="/signup" className="">
                    <Button>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all cursor-pointer">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-sm">
                        <User size={20} />
                      </div>
                      <ChevronDown size={14} className="text-neutral-400 mr-1" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl shadow-xl border-neutral-100" align="end">
                    <DropdownMenuLabel className="p-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">{user.role}</span>
                        <span className="text-sm font-bold text-neutral-900">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-neutral-500 font-medium">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                        <User size={16} /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/my-orders" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                        <Package size={16} /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/admin" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                          <Shield size={16} /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'AGENT' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/agent-dashboard" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                          <Zap size={16} /> Agent Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem className="rounded-xl cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50" onSelect={logout}>
                      <div className="flex items-center gap-2.5 p-2.5 font-medium">
                        <LogOut size={16} /> Logout
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4">

          <div className="flex items-center h-full gap-8">
            <div className="group h-full flex items-center">
              <button
                className="flex items-center gap-2 text-sm font-bold text-neutral-800 hover:text-emerald-700 transition-colors h-full px-2 -ml-2"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                Shop By Category
                <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : 'group-hover:rotate-180'}`} />
              </button>

              <div className={`absolute top-full left-0 w-full bg-white border-b border-neutral-100 shadow-xl transition-all duration-200 ease-out transform origin-top z-40 
                ${isCategoryOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 h-[80vh] md:h-auto overflow-y-auto md:overflow-visible">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-8">
                    {parentCategories.map((parent) => {
                      const children = getChildren(parent._id);
                      return (
                        <div key={parent._id} className="space-y-4">
                          <Link
                            to={`/products?category=${parent.name}`}
                            className="block text-sm font-black text-neutral-900 uppercase tracking-wider hover:text-emerald-600 mb-2"
                            onClick={() => setIsCategoryOpen(false)}
                          >
                            {parent.name}
                          </Link>
                          {children.length > 0 ? (
                            <ul className="space-y-2">
                              {children.map((child) => (
                                <li key={child._id}>
                                  <Link
                                    to={`/products?category=${parent.name}&subcategory=${child.name}`}
                                    className="text-sm text-neutral-600 hover:text-emerald-600 hover:translate-x-1 transition-all inline-block capitalize"
                                    onClick={() => setIsCategoryOpen(false)}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-neutral-400">Browse all {parent.name}</p>
                          )}
                        </div>
                      );
                    })}

                    <div className="bg-neutral-50 rounded-2xl p-6 flex flex-col items-start justify-center">
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">New Arrivals</h3>
                      <p className="text-sm text-neutral-500 mb-4">Check out the latest professional gear.</p>
                      <Link to="/new-arrivals">
                        <Button>
                          Shop New
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/products"
              className="text-sm text-neutral-800 hover:text-emerald-700 transition-colors tracking-wide"
            >
              <button className="flex items-center gap-2 text-sm font-bold text-neutral-800 hover:text-emerald-700 transition-colors h-full px-2 -ml-2">
                See All Products
              </button>
            </Link>
          </div>

        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-neutral-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {!user && (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="py-3 text-center border border-neutral-200 rounded-xl font-bold text-sm">Login</Link>
                  <Link to="/signup" className="py-3 text-center bg-neutral-900 text-white rounded-xl font-bold text-sm">Sign Up</Link>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Categories</h3>
                {parentCategories.map((parent) => {
                  const children = getChildren(parent._id);
                  return (
                    <div key={parent._id} className="border-b border-neutral-50 pb-2">
                      <button
                        onClick={() => {
                          navigate(`/products?category=${parent.name}`);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-between w-full py-2 text-left font-bold text-neutral-800"
                      >
                        {parent.name}
                        <ChevronRight size={16} className="text-neutral-300" />
                      </button>
                      {children.length > 0 && (
                        <div className="pl-4 space-y-2 mt-1 border-l-2 border-neutral-100">
                          {children.map(child => (
                            <Link
                              key={child._id}
                              to={`/products?category=${parent.name}&subcategory=${child.name}`}
                              className="block text-sm text-neutral-500 hover:text-emerald-600 py-1 capitalize"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
