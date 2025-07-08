import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function useMesa() {
  const [mesa, setMesa] = useState(() => localStorage.getItem("mesa") || "");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mesaParam = params.get("mesa");
    if (mesaParam) {
      setMesa(mesaParam);
      localStorage.setItem("mesa", mesaParam);
    }
  }, [location]);

  return mesa;
} 