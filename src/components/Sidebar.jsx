import React, { useState, useRef, useEffect } from "react";
import {
  IconLogo,
  IconDashboard,
  IconCart,
  IconChevronDown,
  IconFilePlus,
  IconBox,
  IconSettings,
  IconBarChart,
} from "./icons.jsx";
import TerraTechPacks from "../assets/TerraTechPacks.png";
import { Link, useLocation  } from "react-router-dom";

// --- Helper Components ---

// Smooth Collapse Container for submenus
const SmoothCollapse = ({ isOpen, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          setHeight(`${contentRef.current.scrollHeight}px`);
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    } else {
      setHeight("0px");
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      style={{ height, overflow: "hidden" }}
      className="transition-all duration-300 ease-in-out"
    >
      <div className="py-[0.15vw] space-y-[0.2vw]">{children}</div>
    </div>
  );
};

// MenuItem (Note: removed outer padding div here to let the parent container handle spacing)
const MenuItem = ({ icon: IconComponent, text, isActive, hasSub, onClick }) => {
  const baseClasses = `flex items-center gap-[0.7vw] w-full px-[1.2vw] py-[0.8vw] rounded-[0.4vw] cursor-pointer transition-all`;

  // Active style: Cyan background
  const activeClasses = "bg-[#22d3ee] shadow-lg text-white font-medium";

  // Inactive style
  const inactiveClasses = "hover:bg-white/10 text-white/90";

  return (
    <div
      className={`
                ${baseClasses} 
                ${isActive ? activeClasses : inactiveClasses}
            `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[0.7vw]">
          <IconComponent className="w-[1.2vw] h-[1.2vw] min-w-[1.2vw]" />
          <span className="text-[.85vw]">{text}</span>
        </div>
        {hasSub && (
          <IconChevronDown
            className={`w-[0.9vw] h-[0.9vw] transition-transform ${
              isActive ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
    </div>
  );
};

// SubMenuItem
const SubMenuItem = ({ text, icon: IconComponent, isSelected }) => (
  // Added subtle horizontal padding to indent subitems slightly inside the border
  <div className={`px-[0vw] mt-[0.1vw]`}>
    <div
      className={`flex items-center gap-[0.7vw] w-full px-[1.2vw] py-[0.8vw] rounded-[0.4vw] cursor-pointer transition-colors text-[.85vw]
                ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
            `}
    >
      <IconComponent className="w-[1.2vw] h-[1.2vw] min-w-[1.2vw]" />
      <span>{text}</span>
    </div>
  </div>
);

// --- Main Sidebar Component ---

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);


   const location = useLocation();
  const currentPath = location.pathname;

  // Active menu detection
  const isOrdersActive = currentPath.startsWith("/iml");
  const isScreenPrintingActive = currentPath.startsWith("/screen");

  const isNewOrder = currentPath === "/iml/new-order";
  const isPurchase = currentPath === "/iml/purchase";
  const isReports = currentPath === "/reports";


  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Helper function to get classes for the wrapper
  // This applies the border, background, and padding when open
  const getWrapperClass = (menuName) => {
    const isOpen = openMenu === menuName;
    return `
            transition-all duration-300 ease-in-out px-[0.5vw]
            ${
              isOpen
                ? "border-[0.1vw] border-white/30 bg-white/5 rounded-[0.8vw] px-[0vw] my-[0.5vw] mx-[0.5vw]" // Open styles
                : "border-transparent py-[0.2vw]" // Closed styles (keeps layout stable)
            }
        `;
  };

  return (
    <aside
      className="w-[15%] left-0 top-0 h-screen text-white flex flex-col overflow-y-auto z-50 shadow-2xl"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #2638A0 60%, #2485B8 100%)",
      }}
    >
      {/* Brand */}
      <div className="h-[5vw] flex items-center px-[1.5vw] border-b border-white/10 justify-center">
        <div className="h-[5vw] flex items-center">
          <img
            src={TerraTechPacks}
            alt="TerraTech Packs Logo"
            className="w-[9.5vw] "
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-[1.5vw] flex flex-col gap-[0.25vw]">
        {/* Standard Item (Wrapper added for alignment consistency) */}
        <div className="px-[0.5vw]">
          <MenuItem
            icon={IconDashboard}
            text="Overview"
            isActive={false}
            onClick={() => {}}
          />
        </div>

        {/* --- IML / ORDERS SECTION --- */}
        <div className={getWrapperClass("orders")}>
          <MenuItem
            icon={IconCart}
            text="IML / Orders"
            hasSub={true}
            isActive={isOrdersActive} 
            onClick={() => toggleMenu("orders")}
          />
          <SmoothCollapse isOpen={openMenu === "orders"}>
            <SmoothCollapse isOpen={openMenu === "orders"}>
              <Link to="/iml/new-order">
                <SubMenuItem
                  text="New order"
                  icon={IconFilePlus}
                  isSelected={isNewOrder}
                />
              </Link>
            </SmoothCollapse>
            <Link to="/iml/purchase">
              <SubMenuItem text="Purchase" icon={IconBox} isSelected={isPurchase} />
            </Link>
            <SubMenuItem
              text="Production"
              icon={IconSettings}
              isSelected={false}
            />
            <SubMenuItem text="Stocks" icon={IconBox} isSelected={false} />
            <SubMenuItem
              text="Billings & Dispatch"
              icon={IconDashboard}
              isSelected={false}
            />
          </SmoothCollapse>
        </div>

        {/* --- SCREEN PRINTING SECTION --- */}
        <div className={getWrapperClass("screenPrinting")}>
          <MenuItem
            icon={IconSettings}
            text="Screen Printing"
            hasSub={true}
            isActive={openMenu === "screenPrinting"}
            onClick={() => toggleMenu("screenPrinting")}
          />
          <SmoothCollapse isOpen={openMenu === "screenPrinting"}>
            <SubMenuItem
              text="New order"
              icon={IconFilePlus}
              isSelected={false}
            />
            <SubMenuItem text="Stocks check" icon={IconBox} isSelected={true} />
            <SubMenuItem
              text="Billings & Dispatch"
              icon={IconDashboard}
              isSelected={false}
            />
          </SmoothCollapse>
        </div>

        {/* Standard Item */}
        <div className="px-[0.5vw]">
          <Link to='/reports'>
          <MenuItem
            icon={IconBarChart}
            text="Reports"
            isActive={isReports}
            onClick={() => {}}
          />
          </Link>
        </div>
      </nav>

      {/* Profile */}
      <div className="p-[1.5vw] border-t border-white/10 flex items-center gap-[1vw] bg-black/10">
        <div className="w-[3vw] h-[3vw] rounded-full bg-gray-300 border-[0.15vw] border-white overflow-hidden shadow-md">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="text-[.95vw] font-semibold">User Name</div>
          <div className="text-[0.8vw] opacity-70">Admin</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
