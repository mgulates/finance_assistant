"use client";

import { useChat, Message } from "@/lib/useChat";
import { useEffect, useRef } from "react";

const Icons = {
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  bot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M3 5h4" />
      <path d="M19 17v4" />
      <path d="M17 19h4" />
    </svg>
  ),
  loader: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

const suggestedQuestions = [
  "Harcama alışkanlıklarımı analiz eder misin?",
  "Bu ay ne kadar tasarruf edebilirim?",
  "En çok nerelere para harcıyorum?",
  "Bütçemi nasıl daha iyi yönetebilirim?",
  "Finansal hedeflerime ulaşmak için ne yapmalıyım?",
];

export default function AIAssistantPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai/chat",
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestedQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div style={{ height: "calc(100vh - 2rem)", display: "flex", flexDirection: "column", padding: "1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            borderRadius: "12px", 
            background: "linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            {Icons.sparkles}
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>FinansAI</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Kişisel finans asistanın</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        className="card" 
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          padding: 0 
        }}
      >
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {messages.length === 0 ? (
            <div style={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              textAlign: "center",
              padding: "2rem"
            }}>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "24px", 
                background: "linear-gradient(135deg, var(--purple-light) 0%, var(--blue-light) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
                color: "var(--purple)"
              }}>
                {Icons.bot}
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Merhaba! Ben FinansAI 👋
              </h2>
              <p style={{ color: "var(--text-muted)", maxWidth: "400px", marginBottom: "2rem", lineHeight: 1.6 }}>
                Finansal durumunu analiz edebilir, bütçe tavsiyeleri verebilir ve hedeflerine ulaşman için stratejiler önerebilirim.
              </p>
              
              {/* Suggested Questions */}
              <div style={{ width: "100%", maxWidth: "500px" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Şunları sorabilirsin:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedQuestion(q)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        border: "1px solid var(--border-light)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "var(--purple)";
                        e.currentTarget.style.color = "var(--purple)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-light)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexDirection: message.role === "user" ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: message.role === "user" 
                        ? "var(--blue-light)" 
                        : "linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: message.role === "user" ? "var(--blue)" : "white",
                      flexShrink: 0
                    }}
                  >
                    {message.role === "user" ? Icons.user : Icons.sparkles}
                  </div>
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "0.875rem 1rem",
                      borderRadius: message.role === "user" 
                        ? "16px 16px 4px 16px" 
                        : "16px 16px 16px 4px",
                      background: message.role === "user" 
                        ? "var(--blue)" 
                        : "var(--bg-secondary)",
                      color: message.role === "user" 
                        ? "white" 
                        : "var(--text-primary)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0
                    }}
                  >
                    {Icons.sparkles}
                  </div>
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      borderRadius: "16px 16px 16px 4px",
                      background: "var(--bg-secondary)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    {Icons.loader}
                    <span>Düşünüyorum...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: "0.75rem 1.5rem", 
            background: "var(--red-light)", 
            color: "var(--red)",
            fontSize: "0.875rem",
            borderTop: "1px solid var(--border-light)"
          }}>
            ⚠️ {error.message || "Bir hata oluştu. Lütfen tekrar deneyin."}
          </div>
        )}

        {/* Input Area */}
        <form 
          onSubmit={handleSubmit}
          style={{ 
            padding: "1rem 1.5rem", 
            borderTop: "1px solid var(--border-light)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center"
          }}
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Bir soru sor..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "0.875rem 1rem",
              borderRadius: "12px",
              border: "1px solid var(--border-light)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "0.9375rem",
              outline: "none",
              transition: "border-color 0.2s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--purple)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              border: "none",
              background: input.trim() && !isLoading 
                ? "linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%)" 
                : "var(--bg-secondary)",
              color: input.trim() && !isLoading ? "white" : "var(--text-muted)",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
          >
            {isLoading ? Icons.loader : Icons.send}
          </button>
        </form>
      </div>
    </div>
  );
}
