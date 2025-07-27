/* ChatWithAi.tsx
   Front-end page for talking to the AI ─ now aligned with the short prompts */

"use client";

import GetBack from "@/Component/subComponents/getBack";
import { IClient, Ifreelancer, useUser } from "@/context/user";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  FC,
  KeyboardEvent
} from "react";
import useSocket2 from "@/hooks/userSocket2";
import { Send } from "lucide-react";
import Loader from "@/Component/loader";

/* ─────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
interface Message {
  roomId: string;
  query: string;
  sender: string;
  aires: string | null;
}

interface AlignmentBlock {
  label: "Service Match" | "Market Positioning";
  percentage: number | null;
  description: string | null;
}

interface ParsedData {
  executiveSummary: string | null;
  priority: string | null;
  attributesLabel: "Key Attributes" | "Core Competencies";
  attributes: string[];
  alignment: AlignmentBlock | null;
  actionItems: string[];
  risk: string[]; // (optional – only for freelancer prompt)
  raw: string;    // keep original for fallback
}

type ParsedResponse =
  | { type: "unstructured"; content: string }
  | { type: "structured"; data: ParsedData };

/* ─────────────────────────────────────────────
   Helper function to clean asterisk formatting
────────────────────────────────────────────── */
const cleanAsteriskFormatting = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold** formatting
    .replace(/\*([^*]+)\*/g, '$1')     // Remove *italic* formatting
    .trim();
};

/* ─────────────────────────────────────────────
   Parser (works for both prompts)
────────────────────────────────────────────── */
const parseAIResponse = (text: string): ParsedResponse => {
  const norm = text.replace(/\r\n/g, "\n");

  // Helper ─ pull one section
  const grab = (headers: string[]): string | null => {
    for (const h of headers) {
      // **1. Executive Summary:**   OR  **Executive Summary**
      const re = new RegExp(
        `\\*\\*\\s*(?:\\d+\\.)?\\s*${h.replace(
          /[-/\\^$*+?.()|[\]{}]/g,
          "\\$&"
        )}\\s*:?\\s*\\*\\*([\\s\\S]*?)(?=\\*\\*\\s*(?:\\d+\\.)?\\s*[A-Z]|\\*\\*$|$)`,
        "i"
      );
      const m = norm.match(re);
      if (m && m[1]) return cleanAsteriskFormatting(m[1].trim());
    }
    return null;
  };

  if (!/\*\*.*Executive Summary.*\*\*/i.test(norm)) {
    // treat as plain text - clean asterisks from unstructured content too
    return { type: "unstructured", content: cleanAsteriskFormatting(text) };
  }

  // Pull core sections
  const executiveSummary = grab(["Executive Summary"]);
  const keyAttrBlock = grab(["Key Attributes", "Core Competencies"]);
  const alignmentBlock = grab(["Service Match", "Market Positioning"]);
  const actionItemsBlock = grab(["Action Items", "Engagement Recommendations"]);
  const riskBlock = grab(["Risk Assessment"]);

  // Priority / Hire priority
  const priorityMatch = norm.match(
    /\b(?:Priority Level|hire priority)\s*:?[\s*]*([A-Z]high|High|Medium|Low)/i
  );
  const priority = priorityMatch ? priorityMatch[1] : null;

  // Helpers - now with asterisk cleaning
  const bullets = (section?: string | null): string[] =>
    section
      ? section
          .split("\n")
          .filter((l) => /^\s*[\*\-]/.test(l.trim()))
          .map((l) => cleanAsteriskFormatting(l.replace(/^\s*[\*\-]\s*/, "").trim()))
          .filter(Boolean)
      : [];

  const percent = (block?: string | null): number | null => {
    if (!block) return null;
    const m = block.match(/(\d{1,3})\s*%/);
    return m ? Number(m[1]) : null;
  };

  const data: ParsedData = {
    executiveSummary,
    priority,
    attributesLabel: /Core Competencies/i.test(norm)
      ? "Core Competencies"
      : "Key Attributes",
    attributes: bullets(keyAttrBlock),
    alignment: alignmentBlock
      ? {
          label: /Market Positioning/i.test(alignmentBlock)
            ? "Market Positioning"
            : "Service Match",
          percentage: percent(alignmentBlock),
          description: cleanAsteriskFormatting(alignmentBlock)
        }
      : null,
    actionItems: bullets(actionItemsBlock),
    risk: bullets(riskBlock),
    raw: text
  };

  return { type: "structured", data };
};

/* ─────────────────────────────────────────────
   Main component
────────────────────────────────────────────── */
const ChatWithAi: FC = () => {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  /* Memoised user & roomId */
  const userData = useMemo(() => user as IClient | Ifreelancer, [user]);
  const roomId = useMemo(
    () => (userData?.userId ? `bot_${userData.userId}` : null),
    [userData?.userId]
  );

  const socketRef = useSocket2(roomId || "");

  /* Socket listeners */
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !roomId) return;

    const handler = (msg: Message) => setMessages((p) => [...p, msg]);
    s.on("message", handler);
    return () => void s.off("message", handler);
  }, [roomId, socketRef]);

  /* Send */
  const send = useCallback(() => {
    if (!query.trim() || !socketRef.current || !userData?.userId) return;
    const msg: Message = {
      roomId: roomId!,
      query: query.trim(),
      sender: userData.userId,
      aires: null
    };
    setMessages((p) => [...p, msg]);
    socketRef.current.emit("message", {
      roomId,
      userId: userData,
      query: query.trim()
    });
    setQuery("");
  }, [query, roomId, socketRef, userData]);

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  if (!userData?.userId)
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="text-lg"><Loader /></span>
      </div>
    );

  /* ───────────────────
     Render helpers
  ──────────────────── */
  const BulletList = ({ items }: { items: string[] }) =>
    items.length ? (
      <ul className="text-sm space-y-1 mt-1">
        {items.map((t, i) => (
          <li key={i} className="flex gap-1">
            <span>•</span>
            <span className="whitespace-pre-wrap">{t}</span>
          </li>
        ))}
      </ul>
    ) : null;

  const StructuredBlock = ({ data }: { data: ParsedData }) => (
    <div className="space-y-4">
      {/* Executive Summary */}
      {data.executiveSummary && (
        <div>
          <p className="font-semibold">Executive Summary</p>
          <p className="whitespace-pre-wrap text-sm">{data.executiveSummary}</p>
          {data.priority && (
            <span className="mt-1 inline-block text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              Priority: {data.priority}
            </span>
          )}
        </div>
      )}

      {/* Attributes / Core Competencies */}
      {data.attributes.length > 0 && (
        <div>
          <p className="font-semibold">{data.attributesLabel}</p>
          <BulletList items={data.attributes} />
        </div>
      )}

      {/* Alignment / Market Positioning */}
      {data.alignment && (
        <div>
          <p className="font-semibold">{data.alignment.label}</p>
          {data.alignment.percentage !== null && (
            <p className="text-sm mb-1">
              {data.alignment.percentage}% Match
            </p>
          )}
          {data.alignment.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {data.alignment.description}
            </p>
          )}
        </div>
      )}

      {/* Action Items */}
      {data.actionItems.length > 0 && (
        <div>
          <p className="font-semibold">Action Items</p>
          <BulletList items={data.actionItems} />
        </div>
      )}

      {/* Risk Assessment (only for freelancer prompt) */}
      {data.risk.length > 0 && (
        <div>
          <p className="font-semibold">Risk Assessment</p>
          <BulletList items={data.risk} />
        </div>
      )}
    </div>
  );

  /* ───────────────────
     Page JSX
  ──────────────────── */
  return (
    <div className="flex flex-col h-screen bg-background">
      <GetBack />

      <div className="flex flex-col justify-between h-[90%] container mx-auto">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 border-2 border-border rounded-xl shadow-2xl hide-scrollbar bg-card">
          {messages.length === 0 ? (
            <div className="text-muted-foreground flex justify-center items-center">
              Start a conversation with our AI
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="space-y-2">
                {/* user bubble */}
                {m.query && (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-[80%]">
                      {m.query}
                    </div>
                  </div>
                )}

                {/* ai bubble */}
                {m.aires && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-2 rounded-lg max-w-[90%]">
                      {(() => {
                        const parsed = parseAIResponse(m.aires);
                        if (parsed.type === "unstructured")
                          return (
                            <pre className="whitespace-pre-wrap text-sm text-foreground">
                              {parsed.content}
                            </pre>
                          );
                        return <StructuredBlock data={parsed.data} />;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="flex items-center border-t border-border px-4 py-3 gap-3 bg-background">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask our AI…"
            className="flex-1 border border-input rounded-full px-4 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={send}
            disabled={!query.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground p-2 rounded-full"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAi;
