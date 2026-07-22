'use client';

import React from 'react';
import { Trash2, X, Loader2, AlertCircle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hobbyTitle?: string;
  category?: string;
  isDeleting?: boolean;
  /* Backwards compatibility props */
  title?: string;
  itemName?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  hobbyTitle,
  category,
  isDeleting = false,
  title = 'Delete Hobby Card',
  itemName,
  message = 'Are you sure you want to delete this hobby card? This action cannot be undone and will remove all logged progress.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const displayTitle = hobbyTitle || itemName;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Soft Pastel Hazard Icon Badge */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3.5 mt-1">
          <Trash2 className="h-5 w-5 stroke-[2]" />
        </div>

        {/* Header Title */}
        <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-1">
          {title}
        </h3>

        {/* Target Card Summary Box */}
        {displayTitle && (
          <div className="my-3.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between text-left">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Target Hobby
              </span>
              <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 truncate">
                {displayTitle}
              </span>
            </div>
            {category && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 px-2.5 py-1 rounded-lg shrink-0">
                {category}
              </span>
            )}
          </div>
        )}

        {/* Warning Message */}
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium mb-5">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-xs font-bold text-stone-700 dark:text-stone-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
