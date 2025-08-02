// components/ui/loader.tsx
import { Loader2 } from 'lucide-react';

export const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
  </div>
);
