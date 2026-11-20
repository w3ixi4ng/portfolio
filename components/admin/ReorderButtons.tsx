"use client";

interface ReorderButtonsProps {
  index: number;
  count: number;
  label: string;
  onMove: (to: number) => void;
  onDelete: () => void;
}

/** ↑ ↓ ✕ controls shared by every list in the editor. */
export function ReorderButtons({ index, count, label, onMove, onDelete }: ReorderButtonsProps) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        className="adm-btn adm-btn-sm"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        aria-label={`Move ${label} up`}
      >
        ↑
      </button>
      <button
        type="button"
        className="adm-btn adm-btn-sm"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        aria-label={`Move ${label} down`}
      >
        ↓
      </button>
      <button
        type="button"
        className="adm-btn adm-btn-sm adm-danger"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
      >
        ✕
      </button>
    </div>
  );
}
