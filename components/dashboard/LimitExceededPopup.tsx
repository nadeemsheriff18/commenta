"use client";
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LimitExceededPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("You’ve exceeded your limit. Please upgrade.");
  const router = useRouter();

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setMessage(e.detail.message || message);
      setIsOpen(true);
    };

    window.addEventListener("show403Popup", handler as EventListener);

    return () => {
      window.removeEventListener("show403Popup", handler as EventListener);
    };
  }, []);

  const goToProPage = () => {
    setIsOpen(false);
    router.push("/proplanpage");
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle />
            <h2 className="text-lg font-semibold">Limit Exceeded</h2>
          </div>
          <p className="mt-4 text-gray-700">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded hover:bg-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
            <button
              className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800"
              onClick={goToProPage}
            >
              Go Pro
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
