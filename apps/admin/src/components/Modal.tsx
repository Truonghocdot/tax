import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal"><div className="modal-heading"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={18} /></button></div>{children}</div></div>;
}
