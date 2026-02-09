import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'Hair Care', path: '/category/hair-care' },
        { label: 'Skin Care', path: '/category/skin-care' },
        { label: 'Equipments', path: '/category/equipments' },
        { label: 'Professional Tools', path: '/category/tools' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Become a Seller', path: '/become-seller' },
        { label: 'Agent Rewards', path: '/agent-rewards' },
        { label: 'Help Center', path: '/help' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Use', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Shipping Policy', path: '/shipping' },
        { label: 'Return Policy', path: '/returns' },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 border-b border-neutral-800 pb-16">
        {/* Brand & Contact */}
        <div className="lg:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-transform shadow-lg">
              <span className="text-neutral-900 font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Salon<span className="text-blue-500">E</span>-Comm</span>
          </Link>
          <p className="text-sm leading-relaxed max-w-sm">
            Empowering salons with premium professional products at exclusive B2B pricing. Your trusted partner in salon business excellence.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-blue-500" />
              <span>+1 (555) Salon-PRO</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-blue-500" />
              <span>support@salonecomm.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-blue-500" />
              <span>Professional Building, Suite 100, Beauty City</span>
            </div>
          </div>
        </div>

        {/* Links Sections */}
        {footerSections.map((section) => (
          <div key={section.title} className="space-y-5">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">{section.title}</h4>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* NewsLetter / Social */}
        <div className="space-y-5 lg:col-span-1">
          <h4 className="text-white font-bold tracking-wider uppercase text-xs">Stay Connected</h4>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
              <Facebook size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-600 hover:text-white transition-all">
              <Twitter size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
              <Instagram size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
              <Youtube size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest">
        <p>© 2026 SALON E-COMM PLATFORM. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-8">
          <span>Secure Payments</span>
          <span>Verified Sellers</span>
          <span>Support 24/7</span>
        </div>
      </div>
    </footer>
  );
}
