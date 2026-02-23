'use client';

import { useVariant } from '../../context/VariantContext';
import { useAppState } from '../../context/AppStateContext';
import { useState } from 'react';

const variantNames = [
  'Zen Garden',
  'Workshop',
  'Conversation',
  'Blueprint',
  'Story Scroll',
  'Origami',
  'Instrument',
  'Split View',
  'Map View',
  'Ritual',
];

export default function Navbar() {
  const { variant, setVariant } = useVariant();
  const { step, reset } = useAppState();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = step !== 'idle';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-lg border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="h-full flex items-center px-4 gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-3 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm hidden sm:block">
            UPSC Buddy
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 shrink-0" />

        {/* Variant Switcher - Scrollable on desktop */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto flex-1 scrollbar-none">
          {variantNames.map((name, i) => (
            <button
              key={i}
              onClick={() => setVariant(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                variant === i + 1
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <span className="text-[10px] opacity-60 mr-1">{i + 1}</span>
              {name}
            </button>
          ))}
        </div>

        {/* Mobile Variant Dropdown */}
        <div className="lg:hidden flex-1 relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700"
          >
            <span className="text-[10px] opacity-60">{variant}</span>
            {variantNames[variant - 1]}
            <svg
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-xl shadow-lg p-1 min-w-48 z-50">
              {variantNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setVariant(i + 1);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    variant === i + 1
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] opacity-60 mr-1.5">{i + 1}</span>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status + Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {isActive && (
            <>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">
                  {step.replace(/-/g, ' ')}
                </span>
              </div>
              <button
                onClick={reset}
                className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
