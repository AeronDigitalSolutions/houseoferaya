"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type DialogTone = "default" | "danger";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
};

type AlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  tone?: DialogTone;
};

type PromptOptions = {
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
};

type DialogRequest =
  | ({
      kind: "confirm";
      resolve: (value: boolean) => void;
    } & ConfirmOptions)
  | ({
      kind: "alert";
      resolve: () => void;
    } & AlertOptions)
  | ({
      kind: "prompt";
      resolve: (value: string | null) => void;
    } & PromptOptions);

type BrandDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const BrandDialogContext = createContext<BrandDialogContextValue | null>(null);

function PremiumDialog({
  request,
  onConfirm,
  onCancel,
  promptValue,
  setPromptValue
}: {
  request: DialogRequest;
  onConfirm: () => void;
  onCancel: () => void;
  promptValue: string;
  setPromptValue: (value: string) => void;
}) {
  const confirmButtonClassName =
    request.tone === "danger"
      ? "border border-rose-500/40 bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-[0_10px_24px_rgba(127,29,29,0.28)] hover:from-rose-800 hover:to-rose-700"
      : "border border-[#d8b16b]/45 bg-gradient-to-r from-[#13275f] to-[#0b1c4f] text-[#f5dfb0] shadow-[0_10px_24px_rgba(8,22,69,0.32)] hover:from-[#163170] hover:to-[#10245d]";

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[4px]">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#d8b16b]/35 bg-[linear-gradient(180deg,#f8f2e9_0%,#fbf8f2_55%,#f5ede1_100%)] shadow-[0_30px_80px_rgba(38,25,8,0.28)]"
      >
        <div className="relative overflow-hidden px-6 pb-6 pt-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(18,43,122,0.22),transparent_66%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="rounded-2xl border border-[#d8b16b]/40 bg-white/70 p-3 shadow-[0_12px_26px_rgba(18,43,122,0.12)]">
              <Image src="/assets/logo.jpeg" alt="House of Eraya" width={52} height={52} className="rounded-xl object-cover" />
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6a33]">House of Eraya</p>
            <h3 className="mt-2 font-heading text-2xl text-[#132252]">{request.title || "Please Confirm"}</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">{request.message}</p>
          </div>

          {request.kind === "prompt" ? (
            <div className="mt-5">
              <input
                autoFocus
                value={promptValue}
                onChange={(event) => setPromptValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onConfirm();
                }}
                placeholder={request.placeholder || "Enter value"}
                className="h-12 w-full rounded-2xl border border-[#d5c1a0] bg-white/90 px-4 text-sm text-stone-900 shadow-inner outline-none transition focus:border-[#c79d4a] focus:ring-2 focus:ring-[#e8d2a4]/60"
              />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {request.kind !== "alert" ? (
              <button
                type="button"
                onClick={onCancel}
                className="min-w-[120px] rounded-full border border-stone-300 bg-white/95 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                {request.cancelLabel || "Cancel"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onConfirm}
              className={`min-w-[120px] rounded-full px-5 py-2.5 text-sm font-medium transition ${confirmButtonClassName}`}
            >
              {request.confirmLabel || (request.kind === "alert" ? "Close" : "Continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const resolverRef = useRef<DialogRequest | null>(null);

  const closeDialog = useCallback(() => {
    setRequest(null);
    resolverRef.current = null;
    setPromptValue("");
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        const nextRequest: DialogRequest = {
          kind: "confirm",
          resolve,
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel,
          cancelLabel: options.cancelLabel,
          tone: options.tone || "default"
        };
        resolverRef.current = nextRequest;
        setRequest(nextRequest);
      }),
    []
  );

  const alert = useCallback(
    (options: AlertOptions) =>
      new Promise<void>((resolve) => {
        const nextRequest: DialogRequest = {
          kind: "alert",
          resolve,
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel,
          tone: options.tone || "default"
        };
        resolverRef.current = nextRequest;
        setRequest(nextRequest);
      }),
    []
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setPromptValue(options.defaultValue || "");
        const nextRequest: DialogRequest = {
          kind: "prompt",
          resolve,
          title: options.title,
          message: options.message,
          defaultValue: options.defaultValue,
          placeholder: options.placeholder,
          confirmLabel: options.confirmLabel,
          cancelLabel: options.cancelLabel,
          tone: options.tone || "default"
        };
        resolverRef.current = nextRequest;
        setRequest(nextRequest);
      }),
    []
  );

  const onCancel = useCallback(() => {
    if (!resolverRef.current) return;
    if (resolverRef.current.kind === "alert") {
      resolverRef.current.resolve();
    } else if (resolverRef.current.kind === "confirm") {
      resolverRef.current.resolve(false);
    } else {
      resolverRef.current.resolve(null);
    }
    closeDialog();
  }, [closeDialog]);

  const onConfirm = useCallback(() => {
    if (!resolverRef.current) return;
    if (resolverRef.current.kind === "alert") {
      resolverRef.current.resolve();
    } else if (resolverRef.current.kind === "confirm") {
      resolverRef.current.resolve(true);
    } else {
      resolverRef.current.resolve(promptValue);
    }
    closeDialog();
  }, [closeDialog, promptValue]);

  useEffect(() => {
    if (!request) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, request]);

  const contextValue = useMemo<BrandDialogContextValue>(
    () => ({
      confirm,
      alert,
      prompt
    }),
    [alert, confirm, prompt]
  );

  return (
    <BrandDialogContext.Provider value={contextValue}>
      {children}
      {request ? (
        <PremiumDialog
          request={request}
          onConfirm={onConfirm}
          onCancel={onCancel}
          promptValue={promptValue}
          setPromptValue={setPromptValue}
        />
      ) : null}
    </BrandDialogContext.Provider>
  );
}

export function useBrandDialog() {
  const context = useContext(BrandDialogContext);
  if (!context) {
    throw new Error("useBrandDialog must be used within BrandDialogProvider.");
  }
  return context;
}
