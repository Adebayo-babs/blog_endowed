'use client';
import { useCallback, useRef, useState } from 'react';
export default function useToast() {
  const [toast, setToast] = useState(null);
  const t = useRef();
  const show = useCallback((message, tone = 'ok') => {
    setToast({ message, tone });
    clearTimeout(t.current);
    t.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return [toast, show];
}
