import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ items = [] }) => {
  return (
    <nav className="flex items-center space-x-6">
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;
