"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({ question, answer, isOpen, onToggle, index }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`
        border-b border-neutral-200 last:border-b-0
        transition-colors duration-300
        ${isOpen ? "bg-primary-50/50" : "bg-transparent hover:bg-neutral-50"}
      `}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${index}`}
      >
        <span className={`
          text-lg font-semibold transition-colors duration-300
          ${isOpen ? "text-primary-700" : "text-neutral-900 group-hover:text-primary-600"}
        `}>
          {question}
        </span>
        <span className={`
          shrink-0 ml-4 p-2 rounded-full transition-all duration-300
          ${isOpen
            ? "bg-primary-100 text-primary-600 rotate-180"
            : "bg-neutral-100 text-neutral-500 group-hover:bg-primary-50 group-hover:text-primary-500"
          }
        `}>
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      <div
        id={`accordion-content-${index}`}
        style={{ height: `${height}px` }}
        className="overflow-hidden transition-all duration-500 ease-out"
      >
        <div ref={contentRef} className="px-6 pb-6">
          <div className="text-neutral-600 leading-relaxed prose prose-neutral max-w-none">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className = "" }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          index={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
