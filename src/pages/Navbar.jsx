import React from 'react';
import logo from '../assets/icar.png';

const Navbar = () => {
  return (
    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-green-800 to-lime-600 shadow-md flex-wrap">
      <img src={logo} alt="Logo" className="h-16 w-auto mr-4" />
      <h1 className="text-white text-sm sm:text-base font-medium tracking-wide">
        Ministry of Agriculture and Farmers Welfare
      </h1>
    </div>
  );
};

export default Navbar;
