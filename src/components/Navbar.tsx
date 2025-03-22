
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-semibold tracking-tight">
              Title
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-12">
              <NavLink href="/projects" active>Projects</NavLink>
              <NavLink href="/account">Account</NavLink>
              <NavLink href="/documentation">Documentation</NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, active }) => {
  return (
    <Link
      to={href}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-300 hover:text-upload-blue ${
        active 
          ? 'border-b-2 border-upload-blue text-upload-blue' 
          : 'text-gray-700 hover:border-b-2 hover:border-gray-300'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
