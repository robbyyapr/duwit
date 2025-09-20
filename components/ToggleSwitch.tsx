
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, id }) => {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium cursor-pointer pr-4">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-light-accent dark:bg-dark-accent' : 'shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset'}`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white dark:bg-gray-300 shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
