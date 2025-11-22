import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STORAGE_KEY = "app3-jurnal-ganduri-automate-v1";

const EMOTIONS = [
  "Bucurie",
  "Liniște",
  "Tristețe",
  "Furie",
  "Frică",
  "Rușine",
  "Vinovăție",
  "Gelozie",
  "Invidie",
  "Mândrie",
  "Dezgust",
];

const DISTORTIONS = [
  "Catastrofare",
  "Gândire alb-negru",
  "Citirea gândurilor",
  "Prezicerea viitorului",
  "Generalizare excesivă",
  "Personalizare",
  "Etichetare globală",
  "„Trebuie” rigide",
  "Alt tip de distorsiune",
];

const PIE_COLORS = ["#22d3ee", "#f97373"]; // rațional / irațional
const BAR_COLOR = "#22c55e";

function App() {
  const [entries, setEntries] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Nu pot citi din localStorage", err);
      return [];
    }
  });

  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState(50);
  const [thought, setThought] = useState("");
  const [thoughtType, setThoughtType] = useState(""); // "rational" | "irrational"
  const [distortion, setDistortion] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error("Nu pot salva în localStorage", err);
    }
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emotion.trim()) return;
    if (!thought.trim()) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      situation: situation.trim(),
      emotion: emotion.trim(),
      intensity,
      thought: thought.trim(),
      thoughtType: thoughtType || "necunoscut",
      distortion: distortion || "Neîncadrat",
    };

    setEntries((prev) => [newEntry, ...prev]);

    setSituation("");
    setEmotion("");
    setIntensity(50);
    setThought("");
    setThoughtType("");
    setDistortion("");
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Ești sigur că vrei să ștergi toate înregistrările din jurnal?"
      )
    ) {
      setEntries([]);
    }
  };

  const emotionStats = useMemo(() => getEmotionStats(entries), [entries]);
  const thoughtTypeStats = useMemo(
    () => getThoughtTypeStats(entries),
    [entries]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* glow background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:py-10">
        <Header />

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <JournalForm
            situation={situation}
            setSituation={setSituation}
            emotion={emotion}
            setEmotion={setEmotion}
            intensity={intensity}
            setIntensity={setIntensity}
            thought={thought}
            setThought={setThought}
            thoughtType={thoughtType}
            setThoughtType={setThoughtType}
            distortion={distortion}
            setDistortion={setDistortion}
            onSubmit={handleSubmit}
          />

          <StatsPanel
            entries={entries}
            emotionStats={emotionStats}
            thoughtTypeStats={thoughtTypeStats}
            onClearAll={handleClearAll}
          />
        </div>

        <JournalList entries={entries} />

        <PsychoEducationSection />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-[11px] text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          CBT · REBT · Jurnal cu gânduri automate
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
          Jurnalul gândurilor automate
          <span className="block bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-lg text-transparent md:text-xl">
            Situație → Emoție → Gând automat → Tip de gând → Distorsiune
          </span>
        </h1>
        <p className="max-w-3xl text-sm text-slate-300 md:text-base">
          Acesta este un jurnal CBT complet. Pentru fiecare situație notezi
          emoția, intensitatea ei, gândul automat care ți-a trecut prin minte,
          dacă este mai degrabă rațional sau irațional și ce tip de distorsiune
          cognitivă conține. Graficul te ajută să vezi ce emoții și ce tipuri de
          gânduri predomină în timp.
        </p>
      </motion.div>
    </header>
  );
}

function JournalForm({
  situation,
  setSituation,
  emotion,
  setEmotion,
  intensity,
  setIntensity,
  thought,
  setThought,
  thoughtType,
  setThoughtType,
  distortion,
  setDistortion,
  onSubmit,
}) {
  return (
    <motion.section
      className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/80"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={onSubmit} className="space-y-4 text-sm">
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Situație / context
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:border-cyan-400 focus:ring"
              placeholder="Unde erai? Cu cine? Ce se întâmpla înainte să apară emoția?"
            />
            <p className="text-[11px] text-slate-400">
              Exemplu: „În bucătărie, copilul a vărsat suc pe jos după ce îl
              rugasem de două ori să fie atent.”
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Emoția principală*
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/50 focus:border-cyan-400 focus:ring"
              >
                <option value="">Alege o emoție…</option>
                {EMOTIONS.map((emo) => (
                  <option key={emo} value={emo}>
                    {emo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-200">
                Intensitatea emoției (0–100)
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-cyan-300">
                  {intensity}%
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Gând automat* (ce ți-a trecut prin minte)
          </label>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:border-cyan-400 focus:ring"
            placeholder="Exemple: „Nu sunt bun de nimic.”, „Iar o să iasă prost.”, „O să mă judece toți.”"
          />
          <p className="text-[11px] text-slate-400">
            Scrie gândul cât mai aproape de formularea lui reală, chiar dacă
            pare exagerat sau „urât”. Așa îl putem analiza ulterior.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Cum ai clasifica acest gând?
            </label>
            <div className="flex flex-col gap-2 text-[11px] text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="thoughtType"
                  value="rational"
                  checked={thoughtType === "rational"}
                  onChange={(e) => setThoughtType(e.target.value)}
                  className="h-3 w-3 accent-emerald-400"
                />
                <span>
                  <span className="font-semibold text-emerald-300">
                    Gând rațional
                  </span>{" "}
                  – realist, flexibil, nu catastrofic, recunoaște că poți
                  suporta situația.
                </span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="thoughtType"
                  value="irrational"
                  checked={thoughtType === "irrational"}
                  onChange={(e) => setThoughtType(e.target.value)}
                  className="h-3 w-3 accent-rose-400"
                />
                <span>
                  <span className="font-semibold text-rose-300">
                    Gând irațional
                  </span>{" "}
                  – absolutist, de tip „trebuie”, „nu suport”, „este groaznic”,
                  duce la emoții foarte intense.
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Distorsiune cognitivă (opțional)
            </label>
            <select
              value={distortion}
              onChange={(e) => setDistortion(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:border-cyan-400 focus:ring"
            >
              <option value="">Alege o distorsiune (dacă o recunoști)…</option>
              {DISTORTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Dacă nu ești sigur, lasă gol. Poți reveni mai târziu să
              recategorizezi gândurile împreună cu un terapeut sau după ce
              aprofundezi teoria.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            *Emoția și gândul automat sunt obligatorii. Restul te ajută să vezi
            tipare (intensitate, tip de gând, distorsiuni).
          </p>
          <button
            type="submit"
            disabled={!emotion || !thought}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Salvează înregistrarea
          </button>
        </div>
      </form>
    </motion.section>
  );
}

function StatsPanel({ entries, emotionStats, thoughtTypeStats, onClearAll }) {
  const total = entries.length;

  return (
    <motion.aside
      className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/80"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-100">
          Harta emoțiilor și a gândurilor
        </h2>
        <p className="text-[11px] text-slate-400">
          Vezi ce emoții apar cel mai des în jurnal și ce tip de gânduri le
          însoțesc – raționale sau iraționale.
        </p>
      </div>

      <div className="space-y-3">
        <div className="h-40 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <div className="mb-1 text-[11px] font-semibold text-slate-200">
            Frecvența emoțiilor
          </div>
          {emotionStats.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
              Adaugă cel puțin o înregistrare pentru a vedea graficul.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="emotion"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #334155",
                    fontSize: 12,
                    color: "#e5e7eb",
                  }}
                />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="h-40 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <div className="mb-1 text-[11px] font-semibold text-slate-200">
            Gânduri raționale vs gânduri iraționale
          </div>
          {total === 0 ? (
            <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
              Nu există suficiente date pentru grafic.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={thoughtTypeStats}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={3}
                >
                  {thoughtTypeStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #334155",
                    fontSize: 12,
                    color: "#e5e7eb",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "#cbd5f5" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="space-y-1 text-[11px] text-slate-300">
        <div>Total înregistrări: {total}</div>
        <div>
          Poți folosi aceste date împreună cu terapeutul tău sau pentru
          auto-reflecție, pentru a observa tiparele de gândire.
        </div>
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="w-full rounded-full border border-slate-700 bg-slate-950/80 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:border-rose-500 hover:text-rose-300"
      >
        Șterge toate înregistrările
      </button>
    </motion.aside>
  );
}

function JournalList({ entries }) {
  return (
    <section className="mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Înregistrări din jurnal
        </h2>
        <p className="text-[11px] text-slate-400">
          Cele mai noi înregistrări apar primele.
        </p>
      </div>

      {entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          Nu ai încă nicio înregistrare. Începe cu o situație recentă, alege
          emoția, notează gândul automat și vezi ce tip de gând este.
        </div>
      )}

      <AnimatePresence>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <motion.article
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200 shadow-lg shadow-slate-950/80"
            >
              <header className="mb-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {entry.emotion} ({entry.intensity}%)
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(entry.date).toLocaleString()}
                </span>
              </header>

              {entry.situation && (
                <EntryField label="Situație / context">
                  {entry.situation}
                </EntryField>
              )}
              <EntryField label="Gând automat">{entry.thought}</EntryField>
              <EntryField label="Tip de gând">
                {entry.thoughtType === "irrational" ? (
                  <span className="text-rose-300">
                    Gând irațional (poate genera emoții nesănătoase)
                  </span>
                ) : entry.thoughtType === "rational" ? (
                  <span className="text-emerald-300">
                    Gând rațional (sprijină emoții sănătoase)
                  </span>
                ) : (
                  "Neîncadrat"
                )}
              </EntryField>
              <EntryField label="Distorsiune cognitivă">
                {entry.distortion}
              </EntryField>
            </motion.article>
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
}

function EntryField({ label, children }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="text-[11px] text-slate-200">{children}</div>
    </div>
  );
}

function PsychoEducationSection() {
  return (
    <section className="mb-6 space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-xs text-slate-300 shadow-xl shadow-slate-950/80">
      <h2 className="text-sm font-semibold text-slate-100">
        Ce este un gând automat? Ce sunt distorsiunile cognitive?
      </h2>
      <p>
        Gândurile automate sunt propoziții scurte, rapide, care apar aproape
        instant în minte atunci când trăim o situație. De multe ori nici nu ne
        dăm seama că „am gândit ceva”, simțim direct emoția (furie, frică,
        tristețe). În CBT și REBT învățăm să încetinim acest proces și să
        surprindem gândul care a declanșat emoția.
      </p>
      <p>
        Unele gânduri sunt <span className="text-emerald-300">raționale</span> –
        realiste, flexibile – și duc la emoții{" "}
        <span className="text-emerald-300">sănătoase, adaptative</span>
        (frustrare, regret, îngrijorare moderată). Alte gânduri sunt{" "}
        <span className="text-rose-300">iraționale</span> – rigide, de tip
        „trebuie”, „nu suport”, „este groaznic” – și duc la emoții{" "}
        <span className="text-rose-300">nesănătoase, dezadaptative</span>
        (furie extremă, disperare, panică).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3">
          <h3 className="mb-1 text-[12px] font-semibold text-emerald-300">
            Exemple de gânduri raționale (emoții sănătoase)
          </h3>
          <ul className="space-y-1 list-disc pl-4">
            <li>„Nu îmi place ce s-a întâmplat, dar pot suporta.”</li>
            <li>
              „Ar fi fost mai bine să iasă altfel, dar pot învăța din asta.”
            </li>
            <li>
              „Mi-e teamă să nu greșesc, dar este normal să mai și greșesc.”
            </li>
            <li>
              „Aș prefera să fiu apreciat, dar nu toată lumea mă va plăcea.”
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3">
          <h3 className="mb-1 text-[12px] font-semibold text-rose-300">
            Exemple de gânduri iraționale (emoții nesănătoase)
          </h3>
          <ul className="space-y-1 list-disc pl-4">
            <li>„Este groaznic, nu ar trebui să fie așa niciodată!”</li>
            <li>„Nu suport să greșesc, ar însemna că sunt un ratat.”</li>
            <li>„Dacă mă critică, înseamnă că nu valorez nimic.”</li>
            <li>„Dacă mă părăsește, viața mea nu mai are sens.”</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3">
        <h3 className="mb-1 text-[12px] font-semibold text-cyan-300">
          Distorsiuni cognitive – câteva exemple
        </h3>
        <ul className="space-y-1 list-disc pl-4">
          <li>
            <span className="font-semibold">Catastrofare:</span> exagerezi
            gravitatea („Este un dezastru total dacă nu reușesc.”).
          </li>
          <li>
            <span className="font-semibold">Gândire alb-negru:</span> vezi
            lucrurile doar în extreme („Ori sunt perfect, ori sunt un eșec.”).
          </li>
          <li>
            <span className="font-semibold">Citirea gândurilor:</span> ești
            sigur că știi ce gândesc ceilalți („Sigur crede că sunt prost.”).
          </li>
          <li>
            <span className="font-semibold">„Trebuie” rigide:</span> reguli dure
            pentru tine sau pentru alții („Oamenii nu ar trebui să facă
            niciodată greșeli.”).
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-slate-400">
          Jurnalul pe care îl folosești acum te ajută să observi treptat ce
          tipuri de distorsiuni apar cel mai des la tine. Pasul următor în
          terapie este să exersezi gânduri alternative, mai echilibrate.
        </p>
      </div>
    </section>
  );
}

function getEmotionStats(entries) {
  const map = {};
  for (const e of entries) {
    if (!e.emotion) continue;
    map[e.emotion] = (map[e.emotion] || 0) + 1;
  }
  return Object.entries(map).map(([emotion, count]) => ({
    emotion,
    count,
  }));
}

function getThoughtTypeStats(entries) {
  let rational = 0;
  let irrational = 0;

  for (const e of entries) {
    if (e.thoughtType === "rational") rational++;
    else if (e.thoughtType === "irrational") irrational++;
  }

  return [
    { name: "Gânduri raționale", value: rational },
    { name: "Gânduri iraționale", value: irrational },
  ];
}

export default App;
