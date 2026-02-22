"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StickyNote, Save, X, Loader2 } from "lucide-react";
import { updateInwardNotes } from "@/actions/inward-notes";
import { toast } from "@/components/ui/use-toast";

type ExpandableNoteRowProps = {
  inwardId: string;
  inumber: string;
  notes: string | null;
  colSpan: number;
  onNotesSaved?: (id: string, notes: string | null) => void;
};

const ExpandableNoteRow: React.FC<ExpandableNoteRowProps> = ({
  inwardId,
  inumber,
  notes,
  colSpan,
  onNotesSaved,
}) => {
  const [noteText, setNoteText] = useState(notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea when panel opens
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
    setHasChanges(e.target.value !== (notes || ""));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateInwardNotes(inwardId, noteText);
      if (result?.error) {
        toast({ title: result.error, variant: "destructive" });
      } else {
        toast({ title: "Notes saved successfully" });
        setHasChanges(false);
        onNotesSaved?.(inwardId, noteText.trim() || null);
      }
    } catch (error) {
      toast({ title: "Failed to save notes", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setNoteText("");
    setHasChanges(notes !== null && notes !== "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <td colSpan={colSpan} className="p-0">
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border-t border-b border-amber-200 dark:border-amber-800/50 px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Notes for Inward #{inumber}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add notes for this inward record... (Ctrl+Enter to save)"
          rows={3}
          className="w-full rounded-md border border-amber-200 dark:border-amber-800 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 resize-y min-h-[80px]"
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            Ctrl+Enter to save
          </p>
          <div className="flex items-center gap-2">
            {noteText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-amber-600 hover:bg-amber-700 text-white h-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </td>
  );
};

export default ExpandableNoteRow;