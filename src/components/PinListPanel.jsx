import React, { useMemo, useState } from "react";


// Extract all unique categories from pins
function getCategories(pins) {
  const set = new Set();
  pins.forEach((p) => p.category && set.add(p.category));
  return Array.from(set);
}

// Only show US state names/abbreviations, not zip codes
const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];
function getStates(pins) {
  const set = new Set();
  pins.forEach((p) => {
    if (p.locationName) {
      const parts = p.locationName.split(',').map(s => s.trim());
      for (const part of parts) {
        if (US_STATES.includes(part)) {
          set.add(part);
        }
      }
    }
  });
  return Array.from(set);
}

function fuzzyMatchScore(str, keyword) {
  if (!str || !keyword) return 0;
  str = str.toLowerCase();
  keyword = keyword.toLowerCase();
  if (str.includes(keyword)) return 100;
  // Fuzzy: count matching chars in order
  let score = 0, j = 0;
  for (let i = 0; i < str.length && j < keyword.length; i++) {
    if (str[i] === keyword[j]) {
      score += 10;
      j++;
    }
  }
  return score;
}


export default function PinListPanel({ pins, setModal }) {
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [keyword, setKeyword] = useState("");
  const categories = useMemo(() => getCategories(pins), [pins]);
  const states = useMemo(() => getStates(pins), [pins]);

  // Filter pins by state, category, and keyword
  const filtered = useMemo(() => {
    let filteredPins = pins;
    if (state) {
      filteredPins = filteredPins.filter((p) => {
        if (!p.locationName) return false;
        const parts = p.locationName.split(',').map(s => s.trim());
        return parts.includes(state);
      });
    }
    if (category) filteredPins = filteredPins.filter((p) => p.category === category);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      filteredPins = filteredPins.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(kw)) ||
          (p.comment && p.comment.toLowerCase().includes(kw)) ||
          (p.locationName && p.locationName.toLowerCase().includes(kw))
      );
      // If no match, show most relevant (highest fuzzy score)
      if (filteredPins.length === 0 && pins.length > 0) {
        let scored = pins.map((p) => {
          let s = Math.max(
            fuzzyMatchScore(p.name, kw),
            fuzzyMatchScore(p.comment, kw),
            fuzzyMatchScore(p.locationName, kw)
          );
          return { pin: p, score: s };
        });
        scored = scored.filter((x) => x.score > 0);
        scored.sort((a, b) => b.score - a.score);
        filteredPins = scored.slice(0, 3).map((x) => x.pin); // show top 3
      }
    }
    return filteredPins;
  }, [pins, state, category, keyword]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h5 style={{ marginTop: 8, marginBottom: 16 }}>All Dropped Pins</h5>
      <div className="mb-2 d-flex gap-2 align-items-center">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowFilter(v => !v)}>
          Filter
        </button>
        <input
          className="form-control form-control-sm"
          style={{ maxWidth: 140 }}
          placeholder="Search keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      {showFilter && (
        <div className="card p-2 mb-2" style={{ maxWidth: 320 }}>
          <div className="mb-2">
            <label className="form-label mb-1">State</label>
            <select className="form-select form-select-sm" value={state} onChange={e => setState(e.target.value)}>
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label mb-1">Category</label>
            <select className="form-select form-select-sm" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setShowFilter(false)}>Apply</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setCategory(''); setState(''); setShowFilter(false); }}>Clear</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: '1em', width: '100%' }}>
        {filtered.length === 0 && <div className="text-muted">No pins match your filter.</div>}
        {filtered.map((pin) => (
          <div
            key={pin.id}
            className="card mb-2"
            style={{
              padding: '1em',
              cursor: 'pointer',
              borderLeft: `6px solid ${pin.color || '#1976d2'}`,
            }}
            onClick={() => setModal({ show: true, viewPin: pin })}
          >
            <div style={{ fontWeight: 'bold', color: pin.color || '#1976d2' }}>
              {pin.name || 'Untitled Pin'}
            </div>
            <div className="small text-muted">
              {pin.locationName && pin.locationName.split(',').slice(0, 2).join(', ')}
            </div>
            <div className="small">
              Category: <span style={{ color: pin.color || '#1976d2' }}>{pin.category}</span>
            </div>
            <div className="small">
              {pin.lat && pin.lng ? `${pin.lat.toFixed(3)}, ${pin.lng.toFixed(3)}` : ''}
            </div>
            <button
              className="btn btn-link btn-sm p-0 mt-1"
              style={{ fontSize: '0.95em' }}
              onClick={(e) => {
                e.stopPropagation();
                setModal({ show: true, viewPin: pin });
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}