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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mesure du DOM (scrollHeight) pour l'animation d'ouverture, nécessite un setState après montage
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden transition-colors">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-3.5 text-left group"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${index}`}
      >
        <span
          className={`flex-1 text-[15px] font-bold transition-colors ${
            isOpen ? "text-brand" : "text-ink group-hover:text-brand"
          }`}
        >
          {question}
        </span>
        <ChevronDown
          className={`shrink-0 h-5 w-5 text-ink-3 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`accordion-content-${index}`}
        style={{ height: `${height}px` }}
        className="overflow-hidden transition-all duration-500 ease-out"
      >
        <div ref={contentRef} className="px-5 pb-5">
          <div className="text-ink-2 text-sm leading-relaxed prose prose-sm max-w-none">
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
    <div className={`flex flex-col gap-2.5 ${className}`}>
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
