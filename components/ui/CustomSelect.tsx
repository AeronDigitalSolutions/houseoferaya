"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type CustomSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type CustomSelectProps = {
  options: CustomSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  align?: "left" | "right";
};

export function CustomSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select option",
  ariaLabel,
  name,
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  optionClassName = "",
  align = "left"
}: CustomSelectProps) {
  const isControlled = typeof value === "string";
  const [internalValue, setInternalValue] = useState<string>(() => defaultValue ?? options[0]?.value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedValue = isControlled ? (value as string) : internalValue;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue]
  );

  const closeMenu = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  const setValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
    closeMenu();
  };

  const enabledOptions = options.filter((option) => !option.disabled);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
              setActiveIndex(0);
            } else {
              setActiveIndex((prev) => Math.min(prev + 1, enabledOptions.length - 1));
            }
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
              setActiveIndex(Math.max(enabledOptions.length - 1, 0));
            } else {
              setActiveIndex((prev) => Math.max(prev - 1, 0));
            }
          }
          if (event.key === "Enter" && isOpen && activeIndex >= 0) {
            event.preventDefault();
            const next = enabledOptions[activeIndex];
            if (next) setValue(next.value);
          }
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-black/12 bg-white px-3 py-2.5 text-left text-sm text-stone-800 transition hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className={!selectedOption ? "text-stone-400" : ""}>{selectedOption?.label ?? placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-stone-500 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className={`absolute z-40 mt-1 max-h-64 min-w-full overflow-auto rounded-2xl border border-black/10 bg-[#f8f4ee] p-1.5 shadow-[0_16px_30px_rgba(32,27,20,0.16)] ${
            align === "right" ? "right-0" : "left-0"
          } ${menuClassName}`}
        >
          {options.map((option, index) => {
            const isSelected = selectedValue === option.value;
            const isActive = activeIndex === enabledOptions.findIndex((item) => item.value === option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onMouseEnter={() => {
                  const enabledIndex = enabledOptions.findIndex((item) => item.value === option.value);
                  setActiveIndex(enabledIndex);
                }}
                onClick={() => {
                  if (!option.disabled) {
                    setValue(option.value);
                  }
                }}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  option.disabled
                    ? "cursor-not-allowed text-stone-400"
                    : isSelected
                    ? "bg-stone-900 text-white"
                    : isActive
                    ? "bg-white text-stone-900"
                    : "text-stone-700 hover:bg-white hover:text-stone-900"
                } ${optionClassName}`}
                data-index={index}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

