
import React, { useState } from 'react';
import Card from './Card';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  startOpen?: boolean;
}

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);


const Accordion: React.FC<AccordionProps> = ({ title, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <Card className="overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex justify-between items-center w-full text-left"
        aria-expanded={isOpen}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <ChevronIcon isOpen={isOpen} />
      </button>
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700/50">
                {children}
            </div>
        </div>
      </div>
    </Card>
  );
};

export default Accordion;
