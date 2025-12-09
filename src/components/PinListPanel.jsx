import React, { useMemo, useState } from "react";
import { getCurrentUser } from '../utils/auth';
import logo from '../assets/DotTheWorld.png';


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


export default function PinListPanel({ pins, setModal, mapBounds, currentUser }) {
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [showInViewOnly, setShowInViewOnly] = useState(false);
  const categories = useMemo(() => getCategories(pins), [pins]);
  const states = useMemo(() => getStates(pins), [pins]);

  // Filter pins by state, category, and keyword
  const filtered = useMemo(() => {
    let filteredPins = pins;
    
    // Filter by current user if "Show Mine" is enabled
    if (showMineOnly && currentUser) {
      filteredPins = filteredPins.filter((p) => p.author && p.author.email === currentUser.email);
    }
    
    // Filter by map bounds if "In View" is enabled
    if (showInViewOnly && mapBounds) {
      filteredPins = filteredPins.filter((p) => {
        return p.lng >= mapBounds.getWest() && 
               p.lng <= mapBounds.getEast() && 
               p.lat >= mapBounds.getSouth() && 
               p.lat <= mapBounds.getNorth();
      });
    }
    
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
  }, [pins, state, category, keyword, showMineOnly, showInViewOnly, currentUser, mapBounds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h4 style={{ marginTop: 8, marginBottom: 16, fontSize: '1.5rem', fontWeight: 'bold' }}>All Dropped Memories 📌</h4>
      <div className="mb-3 d-flex gap-2 align-items-center flex-wrap" style={{ width: '100%' }}>
        <button className="btn btn-outline-secondary" onClick={() => setShowFilter(v => !v)}>
          Filter
        </button>
        <input
          className="form-control"
          style={{ maxWidth: 200 }}
          placeholder="Search keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      {showFilter && (
        <div className="card p-3 mb-3" style={{ maxWidth: 380, width: '100%' }}>
          <div className="mb-3">
            <label className="form-label mb-1" style={{ fontSize: '1rem', fontWeight: '500' }}>State</label>
            <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label mb-1" style={{ fontSize: '1rem', fontWeight: '500' }}>Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowFilter(false)}>Apply</button>
            <button className="btn btn-secondary" onClick={() => { setCategory(''); setState(''); setShowFilter(false); }}>Clear</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: '1em', width: '100%' }}>
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <button 
            className={`btn btn-sm ${showInViewOnly ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setShowInViewOnly(v => !v)}
            disabled={!mapBounds}
          >
            {showInViewOnly ? '✓ In View' : 'In View'}
          </button>
          {currentUser && (
            <button 
              className={`btn btn-sm ${showMineOnly ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setShowMineOnly(v => !v)}
            >
              {showMineOnly ? '✓ My Places' : 'Show Mine'}
            </button>
          )}
          <button className="btn btn-sm btn-outline-success" onClick={()=>window.location.reload()}>Reset View</button>
        </div>
        {filtered.length === 0 && <div className="text-muted">No pins match your filter.</div>}
        {filtered.map((pin) => (
          <div
            key={pin.id}
            className="card mb-2"
            style={{
              padding: '1em',
              cursor: 'pointer',
              borderLeft: `6px solid ${pin.color || '#1976d2'}`,
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              alignItems: 'center'
            }}
            onClick={() => setModal({ show: true, viewPin: pin })}
          >
            <img 
              src={pin.photos && pin.photos.length > 0 ? pin.photos[0] : logo}
              alt={pin.name || 'Pin'}
              style={{
                width: '70px',
                height: '70px',
                objectFit: 'cover',
                borderRadius: '8px',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
              <div className="d-flex justify-content-between align-items-center mt-1">
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.85em' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ show: true, viewPin: pin });
                  }}
                >
                  View Details
                </button>
                {pin.author && (
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    by {pin.author.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}