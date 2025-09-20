import React, { useState, useEffect } from 'react';
import Card from './Card';

interface LockScreenProps {
  onUnlock: () => void;
}

const PIN = '080495';
const PASSWORD = 'P4ks1m1n';

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const handleInput = (value: string) => {
    setError('');
    let newInput = input;
    if (value === 'clear') {
      newInput = '';
    } else if (value === 'del') {
      newInput = input.slice(0, -1);
    } else {
      newInput = input + value;
    }
    
    setInput(newInput);

    if (newInput.length === 6) {
      if (newInput === PIN) {
        onUnlock();
      } else {
        setError('PIN salah.');
        setInput('');
      }
    }
  };

  const handleUnlockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PIN || input === PASSWORD) {
      onUnlock();
    } else {
      setError('PIN atau Password salah.');
      setInput('');
    }
  };

  const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'clear'];

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  const secondHandRotation = seconds * 6;
  const minuteHandRotation = minutes * 6 + seconds * 0.1;
  const hourHandRotation = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <Card className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Aplikasi Terkunci</h2>
        
        <div className="w-48 h-48 mx-auto mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <g className="shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset">
                    <circle cx="50" cy="50" r="48" className="fill-light-bg dark:fill-dark-bg" />
                    <circle cx="50" cy="50" r="48" className="fill-transparent stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
                </g>

                {/* Markers */}
                {Array.from({ length: 12 }).map((_, i) => (
                <line
                    key={i}
                    x1="50" y1="5" x2="50" y2="9"
                    className="stroke-current text-gray-400 dark:text-gray-500"
                    strokeWidth="1"
                    transform={`rotate(${i * 30} 50 50)`}
                />
                ))}

                {/* Hands */}
                <rect x="49.25" y="28" width="1.5" height="22" rx="1" className="fill-current text-light-primary dark:text-dark-primary" transform={`rotate(${hourHandRotation} 50 50)`} />
                <rect x="49.5" y="18" width="1" height="32" rx="0.5" className="fill-current text-light-primary dark:text-dark-primary" transform={`rotate(${minuteHandRotation} 50 50)`} />
                <line x1="50" y1="50" x2="50" y2="14" className="stroke-current text-light-accent dark:text-dark-accent" strokeWidth="0.75" transform={`rotate(${secondHandRotation} 50 50)`} />
                
                {/* Center Pivot */}
                <circle cx="50" cy="50" r="2" className="fill-current text-light-primary dark:text-dark-primary" />
                <circle cx="50" cy="50" r="1" className="fill-current text-light-accent dark:text-dark-accent" />
            </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6">
            {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            })}
        </p>
        
        <form onSubmit={handleUnlockAttempt}>
          <input
            type="password"
            value={'*'.repeat(input.length)}
            readOnly
            className="w-full h-12 mb-4 text-center text-3xl tracking-[.5em] bg-transparent rounded-lg shadow-neumorphic-inset dark:shadow-dark-neumorphic-inset"
            placeholder="PIN"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        </form>
        
        <div className="grid grid-cols-3 gap-3">
          {keypadButtons.map(btn => (
            <button
              key={btn}
              onClick={() => handleInput(btn)}
              className="h-16 text-xl font-bold rounded-2xl shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset active:shadow-neumorphic-inset active:dark:shadow-dark-neumorphic-inset transition-all"
            >
              {btn === 'del' ? '⌫' : btn}
            </button>
          ))}
        </div>
         <button onClick={handleUnlockAttempt} className="mt-4 w-full h-14 bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg font-bold rounded-2xl shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset active:shadow-neumorphic-inset active:dark:shadow-dark-neumorphic-inset transition-all">
          Buka Kunci
        </button>
      </Card>
    </div>
  );
};

export default LockScreen;
