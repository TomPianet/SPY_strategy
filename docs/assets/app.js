export const fmtPct = (x) => {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return (Number(x) * 100).toFixed(2) + "%";
};

export const fmtNum = (x) => {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return Number(x).toFixed(2);
};

export const esc = (s) => String(s).replaceAll("_"," ");

export async function loadJSON(path){
  const r = await fetch(path, {cache:"no-store"});
  if(!r.ok) throw new Error("Cannot load " + path);
  return await r.json();
}

// Very simple CSV parser (works for your exported numeric CSVs)
export async function loadCSV(path){
  const r = await fetch(path, {cache:"no-store"});
  if(!r.ok) throw new Error("Cannot load " + path);
  const text = await r.text();

  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const parts = line.split(",");
    const obj = {};
    headers.forEach((h,i)=> obj[h] = parts[i]);
    return obj;
  });

  return {headers, rows};
}

export function setActiveNav(){
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".navlinks a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if(href === here) a.classList.add("active");
  });
}

export function pickSeries(headers){
  // equity CSV columns expected: date + *_Eq
  const wanted = [
    {key:"Strategy_Net_Eq", label:"Strategy (Net)"},
    {key:"BuyHold_SPY_Eq", label:"Buy & Hold SPY"},
    {key:"BuyHold_SPY_1.3x_Net_Eq", label:"B&H SPY 1.3x (Net)"},
    {key:"BuyHold_SPY_2.0x_Net_Eq", label:"B&H SPY 2.0x (Net)"},
  ];
  return wanted.filter(s => headers.includes(s.key));
}

export function computeDrawdown(eqArr){
  let peak = -Infinity;
  return eqArr.map(v => {
    peak = Math.max(peak, v);
    return (v / peak) - 1.0;
  });
}

export function computeRollingReturn(eqArr, window=252){
  const out = new Array(eqArr.length).fill(null);
  for(let i=window; i<eqArr.length; i++){
    out[i] = (eqArr[i] / eqArr[i-window]) - 1.0;
  }
  return out;
}

export function latestValueFromCSV(csv, col){
  const last = csv.rows[csv.rows.length - 1];
  return last ? Number(last[col]) : NaN;
}

export function yearStartValueFromCSV(csv, col, year){
  // find first row in that year
  for(let i=0; i<csv.rows.length; i++){
    const d = csv.rows[i].date;
    if(!d) continue;
    const y = Number(String(d).slice(0,4));
    if(y === year) return Number(csv.rows[i][col]);
  }
  return NaN;
}
