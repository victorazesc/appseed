"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { WorkspaceUserSummary } from "@/types/workspace";

type MentionTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  users: WorkspaceUserSummary[];
  mentions: string[];
  onMentionsChange: (mentions: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
};

type Suggestion = {
  id: string;
  label: string;
  email: string | null;
};

export function MentionTextarea({
  value,
  onChange,
  users,
  mentions,
  onMentionsChange,
  placeholder,
  disabled,
  rows = 3,
  className,
}: MentionTextareaProps) {
  const [query, setQuery] = useState<string | null>(null);
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionLabelsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!users.length) return;
    for (const mentionId of mentions) {
      if (!mentionLabelsRef.current.has(mentionId)) {
        const user = users.find((candidate) => candidate.id === mentionId);
        if (user) {
          mentionLabelsRef.current.set(mentionId, buildUserLabel(user));
        }
      }
    }
  }, [mentions, users]);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!query) return [];
    const lowered = query.toLowerCase();
    return users
      .filter((user) => {
        const name = user.name?.toLowerCase() ?? "";
        const email = user.email?.toLowerCase() ?? "";
        return name.includes(lowered) || email.includes(lowered);
      })
      .slice(0, 6)
      .map((user) => ({
        id: user.id,
        label: buildUserLabel(user),
        email: user.email ?? null,
      }));
  }, [query, users]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    onChange(newValue);

    const caretPosition = event.target.selectionStart ?? newValue.length;
    const textBeforeCaret = newValue.slice(0, caretPosition);
    const match = /(^|\s)@([^@\s]*)$/i.exec(textBeforeCaret);

    if (match) {
      setAnchorIndex(caretPosition - match[2].length - 1);
      setQuery(match[2]);
    } else {
      setAnchorIndex(null);
      setQuery(null);
    }

    // remove mentions whose labels are no longer present
    const activeLabels = new Set<string>();
    for (const [id, label] of mentionLabelsRef.current.entries()) {
      if (!newValue.includes(`@${label}`)) {
        mentionLabelsRef.current.delete(id);
      } else {
        activeLabels.add(id);
      }
    }
    const newMentions = mentions.filter((id) => activeLabels.has(id));
    if (newMentions.length !== mentions.length) {
      onMentionsChange(newMentions);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (!textareaRef.current) return;
    const label = suggestion.label;

    const caretPosition = textareaRef.current.selectionStart ?? value.length;
    const start = anchorIndex ?? caretPosition;
    const end = caretPosition;

    const before = value.slice(0, start);
    const after = value.slice(end);
    const insertion = `@${label} `;
    const nextValue = `${before}${insertion}${after}`;
    onChange(nextValue);

    mentionLabelsRef.current.set(suggestion.id, label);
    if (!mentions.includes(suggestion.id)) {
      onMentionsChange([...mentions, suggestion.id]);
    }

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const cursorPosition = (before + insertion).length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    });

    setQuery(null);
    setAnchorIndex(null);
  };

  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {query && suggestions.length ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-48 max-w-sm overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <ul className="max-h-48 overflow-y-auto text-sm">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <span className="font-medium text-foreground">{suggestion.label}</span>
                  {suggestion.email ? (
                    <span className="text-xs text-muted-foreground">{suggestion.email}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function buildUserLabel(user: WorkspaceUserSummary) {
  return user.name?.trim() || user.email || "Usuário";
}
