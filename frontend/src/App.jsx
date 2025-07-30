import React, { useState, useRef } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function App() {
  const [listening, setListening] = useState(false);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const handleListen = () => {
    if (!recognition) return alert("Speech Recognition not supported");
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  if (recognition) {
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setCommand(text);
      handleCommand(text);
    };
    recognition.onend = () => setListening(false);
  }

  const handleCommand = async (text) => {
    let response = "";
    setLoading(true);
    // Local actions
    if (text.toLowerCase().includes("open google")) {
      window.open("https://google.com", "_blank");
      response = "Opening Google.";
    } else if (text.toLowerCase().includes("time")) {
      response = "The time is " + new Date().toLocaleTimeString();
    } else if (text.toLowerCase().includes("search youtube for")) {
      const query = text.split("search youtube for")[1];
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
      response = `Searching YouTube for ${query}`;
    } else {
      // Send to backend for GPT response
      try {
        const res = await fetch("http://localhost:5000/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text })
        });
        const data = await res.json();
        response = data.response || "Sorry, I couldn't get an answer.";
      } catch {
        response = "Error contacting server.";
      }
    }
    synthRef.current.speak(new SpeechSynthesisUtterance(response));
    setHistory((h) => [...h, { command: text, response }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-teal-50 flex flex-col items-center justify-center overflow-auto">
      {/* Navbar */}
      <nav className="w-full sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-indigo-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-indigo-700 text-xl font-extrabold tracking-wide">Voice Assistant</span>
            <span className="text-indigo-400 text-2xl">🤖</span>
          </div>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors text-base flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.104.823 2.226 0 1.606-.015 2.898-.015 3.293 0 .321.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/></svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>
      {/* Main chat UI */}
      <div className="w-full max-w-lg mx-auto mt-8 mb-0 bg-white/70 rounded-3xl shadow-2xl p-6 min-h-[500px] relative backdrop-blur border border-indigo-100 z-10">
        <h1 className="text-center text-indigo-700 mb-6 font-extrabold tracking-wide text-2xl">Voice Assistant</h1>
        <div className="flex flex-col gap-5 min-h-[320px] mb-20">
          {history.length === 0 && (
            <div className="text-gray-400 text-center mt-20">
              Try saying: <br />
              <span className="text-indigo-600">
                "What is the time?", "Open Google", "Search YouTube for relaxing music", "Tell me a joke"
              </span>
            </div>
          )}
          {history.map((item, i) => (
            <React.Fragment key={i}>
              <div className="flex items-end justify-end gap-2 animate-fadeIn">
                <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[70vw] text-base shadow-md break-words">
                  {item.command}
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow">🧑</div>
              </div>
              <div className="flex items-end justify-start gap-2 animate-fadeIn">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-indigo-600 border border-indigo-600 flex items-center justify-center text-lg font-bold shadow">🤖</div>
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-md max-w-[70vw] text-base shadow break-words">
                  {item.response}
                </div>
              </div>
            </React.Fragment>
          ))}
          {loading && <div className="text-center text-gray-400 text-base my-3">Thinking...</div>}
        </div>
        {command && !loading && (
          <div className="text-center text-indigo-600 font-medium text-lg mt-4">Heard: "{command}"</div>
        )}
        <button
          onClick={handleListen}
          className={`fixed left-1/2 bottom-10 -translate-x-1/2 bg-white text-indigo-600 border-2 border-indigo-200 rounded-full w-20 h-20 shadow-lg flex items-center justify-center text-4xl transition-all duration-200 outline-none hover:bg-indigo-600 hover:text-white hover:shadow-2xl focus:ring-4 focus:ring-indigo-200 z-20 ${listening ? 'bg-indigo-600 text-white animate-pulse hover:cursor-pointer' : ''}`}

          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          <span role="img" aria-label="microphone">
            {listening ? "🎤" : "🎙️"}
          </span>
        </button>
        {/* Animations for fadeIn */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s;
          }
        `}</style>
      </div>
      <div className="mt-8 text-center text-gray-400 text-sm tracking-wide z-10">
        <span>Made with <span className="text-indigo-600">♥</span> | Voice Assistant MVP</span>
      </div>
    </div>
  );
}
