import { useState, useRef, useEffect } from "react";
import logo from "./assets/InsightDoc.png";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function uploadPDF(pickedFile) {
    const target = pickedFile || file;
    if (!target) return setError("Please select a PDF first.");

    setBusy(true);
    setError("");

    try {
      const body = new FormData();
      body.append("file", target);

      const response = await fetch(`${API}/upload`, {
        method: "POST",
        body,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Upload failed");

      setUploaded(true);
      setFile(target);
      setMessages([
        {
          role: "assistant",
          text: `Document ready! ${data.pages} pages and ${data.chunks} chunks processed. Ask your question below.`,
          sources: [],
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function askQuestion(e) {
    e.preventDefault();
    if (!question.trim() || !uploaded || busy) return;

    const q = question.trim();
    setQuestion("");
    setError("");
    setBusy(true);

    setMessages((old) => [
      ...old,
      { role: "user", text: q },
      { role: "assistant", text: "Thinking...", sources: [], loading: true },
    ]);

    try {
      const response = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Request failed");

      setMessages((old) => {
        const next = [...old];
        next[next.length - 1] = {
          role: "assistant",
          text: data.answer,
          sources: data.sources || [],
        };
        return next;
      });
    } catch (err) {
      setMessages((old) => {
        const next = [...old];
        next[next.length - 1] = {
          role: "assistant",
          text: `Error: ${err.message}`,
          sources: [],
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  function handleNewFile(e) {
    const picked = e.target.files?.[0];
    if (picked) {
      setUploaded(false);
      setMessages([]);
      uploadPDF(picked);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0d14] text-slate-100 md:flex">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse-slow" />
      </div>

      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b border-white/10 bg-[#10121c]/80 backdrop-blur-xl p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r animate-slide-in-left">
        <div className="group flex items-center gap-3 text-xl font-bold tracking-tight">
          <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/40 ring-1 ring-white/10 transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
            <img
              src={logo}
              alt="InsightDoc logo"
              className="size-full object-cover"
            />
          </div>
          <span className="bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
            InsightDoc
          </span>
        </div>

        <p className="mb-3 mt-10 text-xs font-semibold tracking-[0.2em] text-slate-500">
          WORKSPACE
        </p>
        <div className="group relative overflow-hidden rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-sm text-violet-200 transition-all duration-300 hover:border-violet-400/40 hover:bg-violet-500/20">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-400/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">◈ &nbsp; Document Chat</span>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 md:mt-auto">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          RAG engine online
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-7 md:px-10 animate-fade-down">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-violet-300">
              YOUR AI READING ASSISTANT
            </p>
            <h1 className="mt-2 bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
              Document Intelligence
            </h1>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 backdrop-blur">
            <span className="mr-2 text-emerald-400">●</span>
            API workspace
          </span>
        </header>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-4 md:p-8">
          {/* Upload card — only shows when NOT uploaded */}
          {!uploaded && (
            <section className="animate-fade-up rounded-2xl border border-white/10 bg-gradient-to-br from-[#191b2b]/90 to-[#11131d]/90 p-5 shadow-2xl shadow-violet-900/20 backdrop-blur md:p-7 transition-all duration-500">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">Upload your document</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    PDF in. Answers out.
                  </p>
                </div>
                <span className="text-2xl text-violet-300">↑</span>
              </div>

              <label className="group mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-400/40 bg-violet-500/[0.04] p-5 text-center transition-all duration-300 hover:scale-[1.01] hover:border-violet-400/70 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-600/20">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setUploaded(false);
                    setError("");
                  }}
                />
                <span className="rounded-lg bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-300 transition-transform duration-300 group-hover:scale-110">
                  PDF
                </span>
                <span className="mt-3 max-w-full break-all text-sm font-medium">
                  {file ? file.name : "Choose a PDF to get started"}
                </span>
                <span className="mt-2 text-xs text-slate-500">
                  Click to browse your files
                </span>
              </label>

              <button
                onClick={() => uploadPDF()}
                disabled={!file || busy}
                className="group relative mt-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold shadow-lg shadow-violet-900/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-violet-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  {busy ? "Processing..." : "Upload & process PDF →"}
                </span>
              </button>

              {error && (
                <p className="mt-3 break-words text-xs text-rose-400 animate-fade-up">
                  {error}
                </p>
              )}
            </section>
          )}

          {/* Chat card */}
          <section
            className={`flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141620]/90 backdrop-blur shadow-2xl shadow-black/40 transition-all duration-500 animate-fade-up ${
              uploaded ? "flex-1 min-h-[70vh]" : "mt-5"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                {uploaded && (
                  <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-rose-500/20 to-violet-500/20 text-xs font-bold text-rose-200 ring-1 ring-white/10">
                    PDF
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">
                    {uploaded
                      ? "Chat with your document"
                      : "Chat with your document"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400 truncate max-w-xs">
                    {uploaded && file
                      ? file.name
                      : "Ask questions and explore source pages"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-violet-300">
                  RAG POWERED
                </span>
                {uploaded && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    className="group rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-300 transition-all duration-300 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200 disabled:opacity-50"
                    title="Upload a new PDF"
                  >
                    <span className="inline-block transition-transform duration-300 group-hover:rotate-90">
                      ↻
                    </span>{" "}
                    NEW PDF
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleNewFile}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-64 max-h-[520px] space-y-6 overflow-y-auto p-5 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="mx-auto flex min-h-56 max-w-sm flex-col items-center justify-center text-center animate-fade-up">
                  <div className="grid size-12 place-items-center rounded-2xl bg-violet-500/15 text-2xl text-violet-300 animate-float">
                    ✳
                  </div>
                  <h3 className="mt-4 font-semibold">
                    Your document, understood.
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    Upload a PDF and ask questions in natural language. Answers
                    and relevant source pages will appear here.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 animate-fade-up"
                    style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                  >
                    <div
                      className={`grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg text-xs font-bold transition-transform duration-300 hover:scale-110 ${
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-100 ring-1 ring-violet-400/20"
                          : "bg-gradient-to-br from-sky-500/25 to-cyan-500/15 text-sky-100 ring-1 ring-sky-400/20"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <img
                          src={logo}
                          alt="InsightDoc"
                          className="size-full object-cover"
                        />
                      ) : (
                        "Y"
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-xs font-semibold text-slate-300">
                        {msg.role === "assistant" ? "InsightDoc" : "You"}
                      </p>

                      {msg.loading ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <span className="size-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                          <span className="size-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                          <span className="size-2 animate-bounce rounded-full bg-violet-400" />
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                          {msg.text}
                        </p>
                      )}

                      {msg.sources?.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-violet-300">
                            Sources from your PDF
                          </p>
                          {msg.sources.map((source, j) => (
                            <div
                              key={j}
                              className="group rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/[0.06] hover:translate-x-1"
                            >
                              <p className="text-xs font-semibold text-violet-300">
                                Page {source.page}
                              </p>
                              <p className="mt-2 break-words text-xs leading-6 text-slate-400">
                                {source.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={askQuestion}
              className={`mx-4 mb-3 flex gap-2 rounded-xl border border-white/10 bg-[#0c0e16]/80 p-2 backdrop-blur transition-all duration-300 focus-within:border-violet-400/40 focus-within:shadow-lg focus-within:shadow-violet-900/30 md:mx-5 ${
                !uploaded ? "opacity-60" : ""
              }`}
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  uploaded
                    ? "Ask anything about your PDF..."
                    : "Upload a PDF first to start chatting..."
                }
                disabled={!uploaded}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!uploaded || !question.trim() || busy}
                className="group grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl shadow-lg shadow-violet-900/40 transition-all duration-300 hover:scale-105 hover:shadow-violet-600/50 disabled:opacity-40 disabled:hover:scale-100"
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                  ↑
                </span>
              </button>
            </form>
            <p className="px-4 pb-4 text-center text-[10px] leading-5 text-slate-500">
              AI-generated answers can make mistakes. Verify important details.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}