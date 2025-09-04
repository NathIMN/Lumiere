import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

const ContextMenu = ({ items, className = '', trigger = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="More actions"
      >
        {trigger || <MoreVertical className="h-4 w-4 text-gray-500" />}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`
                w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors
                ${item.disabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : item.destructive 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;