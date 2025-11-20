import React, { useRef, useState } from 'react';

const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#e53935' },
  { name: 'ViewPoint', color: '#3949ab' },
  { name: 'Museum', color: '#00897b' },
  { name: 'Other', color: '#fbc02d' },
];

export default function PinDetailsModal({ show, onClose, onSave, locationName, lat, lng, viewPin }) {
  const nameRef = useRef();
  const commentRef = useRef();
  const photosRef = useRef();
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [customCat, setCustomCat] = useState('');
  const [customColor, setCustomColor] = useState('#1976d2');

  if (!show) return null;

  if (viewPin) {
    // View mode for existing pin
    return (
      <div className="modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1050,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="modal-content" style={{background:'#fff',padding:24,borderRadius:8,minWidth:320,maxWidth:400}}>
          <h5>Pin Details</h5>
          <div className="mb-2 small text-muted">
            <div><b>Location:</b> {viewPin.locationName || ''}</div>
            <div><b>Coordinates:</b> {viewPin.lat && viewPin.lng ? `${viewPin.lat.toFixed(5)}, ${viewPin.lng.toFixed(5)}` : ''}</div>
            <div><b>Category:</b> <span style={{color:viewPin.color,fontWeight:'bold'}}>{viewPin.category}</span></div>
          </div>
          <div className="mb-2"><b>Name:</b> {viewPin.name}</div>
          <div className="mb-2"><b>Comments:</b> {viewPin.comment}</div>
          {viewPin.photos && viewPin.photos.length > 0 && (
            <div className="mb-2"><b>Photos:</b><br/>{viewPin.photos.map((p,i)=>(<img key={i} src={p} alt="pic" style={{width:80,marginRight:6,marginTop:6}}/>))}</div>
          )}
          <div className="d-flex gap-2 mt-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = nameRef.current.value;
    const comment = commentRef.current.value;
    const files = photosRef.current.files;
    let photos = [];
    const catToUse = customCat.trim() ? customCat.trim() : category;
    const colorToUse = customCat.trim() ? customColor : (DEFAULT_CATEGORIES.find(c=>c.name===category)?.color || '#1976d2');
    if (files && files.length) {
      const readers = Array.from(files).map(f => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      }));
      Promise.all(readers).then(imgs => {
        photos = imgs;
        onSave({ name, category: catToUse, color: colorToUse, comment, photos });
      });
      return;
    }
    onSave({ name, category: catToUse, color: colorToUse, comment, photos });
  }

  return (
    <div className="modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1050,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#fff',padding:24,borderRadius:8,minWidth:320,maxWidth:400}}>
        <h5>Add Pin Details</h5>
        <div className="mb-2 small text-muted">
          <div><b>Location:</b> {locationName ? locationName : 'Loading...'} </div>
          <div><b>Coordinates:</b> {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : ''}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Name</label>
            <input ref={nameRef} className="form-control" required />
          </div>
          <div className="mb-2">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e=>setCategory(e.target.value)}>
              {DEFAULT_CATEGORIES.map(c=>(<option key={c.name} value={c.name}>{c.name}</option>))}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Or create your own</label>
            <input className="form-control" placeholder="Custom category" value={customCat} onChange={e=>setCustomCat(e.target.value)} />
            {customCat.trim() && (
              <div className="mt-1">
                <label>Color: </label>
                <input type="color" value={customColor} onChange={e=>setCustomColor(e.target.value)} style={{marginLeft:8}} />
              </div>
            )}
          </div>
          <div className="mb-2">
            <label className="form-label">Photos</label>
            <input ref={photosRef} type="file" accept="image/*" multiple className="form-control" />
          </div>
          <div className="mb-2">
            <label className="form-label">Comments</label>
            <textarea ref={commentRef} className="form-control" rows={3}></textarea>
          </div>
          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
