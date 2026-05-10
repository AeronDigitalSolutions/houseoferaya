"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

export function PasswordInput({
  value,
  onChange,
  placeholder,
  required = false,
  name,
  id,
  autoComplete,
  className = "",
  inputClassName = "",
  buttonClassName = ""
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm text-stone-800 outline-none transition focus:border-[#9c7346] focus:ring-2 focus:ring-[#9c7346]/20 ${inputClassName}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className={`absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 ${buttonClassName}`}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

