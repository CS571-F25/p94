import React, { useRef, useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';

const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#e53935' },
  { name: 'ViewPoint', color: '#3949ab' },
  { name: 'Museum', color: '#00897b' },
  { name: 'Other', color: '#fbc02d' },
];

const CUSTOM_CATEGORIES_KEY = 'dots_custom_categories';

function getCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomCategory(name, color) {
  const customCats = getCustomCategories();
  // Check if category already exists
  if (!customCats.find(c => c.name === name)) {
    customCats.push({ name, color });
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCats));
  }
}

export default function PinDetailsPanel({ show, onClose, onSave, onDelete, onAddComment, onEditPin, onLikeComment, onReplyComment, locationName, lat, lng, viewPin }) {
  const nameRef = useRef();
  const commentRef = useRef();
  const photosRef = useRef();
  const newCommentRef = useRef();
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [customCat, setCustomCat] = useState('');
  const [customColor, setCustomColor] = useState('#1976d2');
  const [customCategories, setCustomCategories] = useState(getCustomCategories());
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPhotos, setEditedPhotos] = useState([]);
  const [editedCategory, setEditedCategory] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    setCategory(DEFAULT_CATEGORIES[0].name);
    setCustomCat('');
    setCustomColor('#1976d2');
    setCustomCategories(getCustomCategories());
    setIsEditing(false);
    setReplyTo(null);
    if (viewPin) {
      setEditedName(viewPin.name || '');
      setEditedDescription(viewPin.comment || '');
      setEditedPhotos(viewPin.photos || []);
      setEditedCategory(viewPin.category || '');
      setEditedColor(viewPin.color || '#1976d2');
    }
  }, [show, viewPin]);

  if (!show) return null;

  if (viewPin) {
    // View mode for existing pin
    const isOwner = currentUser && viewPin.author && currentUser.email === viewPin.author.email;
    const pinComments = viewPin.comments || [];
    
    function handleAddComment() {
      if (!currentUser) {
        alert('Please log in to comment');
        return;
      }
      const commentText = newCommentRef.current.value.trim();
      if (!commentText) return;
      
      if (onAddComment) {
        onAddComment(viewPin.id, {
          text: commentText,
          author: {
            name: currentUser.name,
            email: currentUser.email
          },
          createdAt: new Date().toISOString(),
          likes: [],
          replies: [],
          replyTo: replyTo
        });
        newCommentRef.current.value = '';
        setReplyTo(null);
      }
    }
    
    function handleSaveEdit() {
      if (onEditPin) {
        onEditPin(viewPin.id, {
          name: editedName,
          comment: editedDescription,
          photos: editedPhotos,
          category: editedCategory,
          color: editedColor
        });
        setIsEditing(false);
      }
    }
    
    function handleRemovePhoto(index) {
      setEditedPhotos(prev => prev.filter((_, i) => i !== index));
    }
    
    function handleAddPhotos(e) {
      const files = e.target.files;
      if (files && files.length) {
        const remainingSlots = 5 - editedPhotos.length;
        if (remainingSlots <= 0) {
          alert('Maximum 5 photos allowed');
          return;
        }
        const filesToAdd = Array.from(files).slice(0, remainingSlots);
        if (files.length > remainingSlots) {
          alert(`Only ${remainingSlots} more photo(s) can be added (max 5 total)`);
        }
        
        // Compress images before adding
        const readers = filesToAdd.map(f => new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxSize = 800;
              let width = img.width;
              let height = img.height;
              
              if (width > height) {
                if (width > maxSize) {
                  height *= maxSize / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width *= maxSize / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              res(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = rej;
            img.src = e.target.result;
          };
          reader.onerror = rej;
          reader.readAsDataURL(f);
        }));
        
        Promise.all(readers).then(imgs => {
          setEditedPhotos(prev => [...prev, ...imgs]);
        }).catch(err => {
          console.error('Error processing images:', err);
          alert('Error processing images. Please try again.');
        });
      }
    }
    
    if (isEditing && isOwner) {
      const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
      
      return (
        <div className="card" style={{marginTop:8}}>
          <h5>Edit Pin</h5>
          <div className="mb-2">
            <label className="form-label">Name</label>
            <input 
              className="form-control" 
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Category</label>
            <select 
              className="form-select" 
              value={editedCategory}
              onChange={(e) => {
                const selectedCat = allCategories.find(c => c.name === e.target.value);
                setEditedCategory(e.target.value);
                if (selectedCat) {
                  setEditedColor(selectedCat.color);
                }
              }}
            >
              {allCategories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              rows={3}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Photos ({editedPhotos.length}/5)</label>
            <div className="mb-2">
              {editedPhotos.map((p, i) => (
                <div key={i} style={{display: 'inline-block', position: 'relative', marginRight: 6}}>
                  <img src={p} alt="pic" style={{width:80, height:80, objectFit: 'cover'}}/>
                  <button 
                    className="btn btn-danger btn-sm"
                    style={{position: 'absolute', top: 0, right: 0, padding: '2px 6px'}}
                    onClick={() => handleRemovePhoto(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="form-control" 
              onChange={handleAddPhotos}
              disabled={editedPhotos.length >= 5}
            />
            {editedPhotos.length >= 5 && (
              <small className="text-muted">Maximum 5 photos reached</small>
            )}
          </div>
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>Save Changes</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="card" style={{marginTop:8}}>
        <h5>{viewPin.name || 'Pin Details'}</h5>
        {viewPin.author && (
          <div className="mb-2" style={{fontSize: '0.9rem'}}>
            <b>Created by:</b>{' '}
            <a 
              href={`#/user-profile/${encodeURIComponent(viewPin.author.email)}`}
              style={{color: '#D4A574', textDecoration: 'none', cursor: 'pointer', fontWeight: 'bold'}}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              {viewPin.author.name}
            </a>
          </div>
        )}
        <div className="mb-2 small text-muted">
          <div><b>Location:</b> {viewPin.locationName || ''}</div>
          <div><b>Coordinates:</b> {viewPin.lat && viewPin.lng ? `${viewPin.lat.toFixed(5)}, ${viewPin.lng.toFixed(5)}` : ''}</div>
          <div><b>Category:</b> <span style={{color:viewPin.color,fontWeight:'bold'}}>{viewPin.category}</span></div>
        </div>
        <div className="mb-2"><b>Description:</b> {viewPin.comment}</div>
        {viewPin.photos && viewPin.photos.length > 0 && (
          <div className="mb-2"><b>Photos:</b><br/>{viewPin.photos.map((p,i)=>(<img key={i} src={p} alt="pic" style={{width:80,marginRight:6,marginTop:6}}/>))}</div>
        )}
        
        {/* Comments Section */}
        <div className="mt-3 mb-2">
          <h6>Comments ({pinComments.length})</h6>
          {pinComments.length > 0 ? (
            <div style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem'}}>
              {pinComments.map((comment, idx) => (
                <div key={idx} className="mb-2 p-2 bg-light rounded">
                  {comment.replyTo !== null && comment.replyTo !== undefined && (
                    <div className="small text-muted mb-1">
                      <i>Replying to {pinComments[comment.replyTo]?.author.name}</i>
                    </div>
                  )}
                  <div className="small d-flex justify-content-between align-items-start">
                    <div>
                      <a 
                        href={`#/user-profile/${encodeURIComponent(comment.author.email)}`}
                        style={{color: '#D4A574', textDecoration: 'none', fontWeight: 'bold'}}
                      >
                        {comment.author.name}
                      </a>
                      <span className="text-muted ms-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">{comment.text}</div>
                  <div className="d-flex gap-2 mt-1">
                    {currentUser && onLikeComment && (
                      <button 
                        className="btn btn-link btn-sm p-0"
                        style={{fontSize: '0.85rem'}}
                        onClick={() => onLikeComment(viewPin.id, idx)}
                      >
                        👍 {comment.likes?.length || 0}
                      </button>
                    )}
                    {currentUser && (
                      <button 
                        className="btn btn-link btn-sm p-0"
                        style={{fontSize: '0.85rem'}}
                        onClick={() => {
                          setReplyTo(idx);
                          newCommentRef.current?.focus();
                        }}
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="small text-muted">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Add Comment */}
          {currentUser && (
            <div className="mt-2">
              {replyTo !== null && (
                <div className="small text-muted mb-1">
                  Replying to {pinComments[replyTo]?.author.name}
                  <button 
                    className="btn btn-link btn-sm p-0 ms-2"
                    onClick={() => setReplyTo(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea 
                ref={newCommentRef}
                className="form-control form-control-sm mb-2" 
                rows={2}
                placeholder={replyTo !== null ? "Write a reply..." : "Add a comment..."}
              />
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleAddComment}
              >
                {replyTo !== null ? 'Reply' : 'Comment'}
              </button>
            </div>
          )}
        </div>
        
        <div className="d-flex gap-2 mt-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          {isOwner && (
            <>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
              {onDelete && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(viewPin.id)}>Delete</button>
              )}
            </>
          )}
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
    const colorToUse = customCat.trim() ? customColor : (DEFAULT_CATEGORIES.find(c=>c.name===category)?.color || customCategories.find(c=>c.name===category)?.color || '#1976d2');
    
    // Save custom category if user created a new one
    if (customCat.trim()) {
      saveCustomCategory(customCat.trim(), customColor);
    }
    
    if (files && files.length) {
      if (files.length > 5) {
        alert('Maximum 5 photos allowed');
        return;
      }
      
      // Compress images before saving
      const readers = Array.from(files).map(f => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            res(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = rej;
          img.src = e.target.result;
        };
        reader.onerror = rej;
        reader.readAsDataURL(f);
      }));
      
      Promise.all(readers).then(imgs => {
        photos = imgs;
        onSave({ name, category: catToUse, color: colorToUse, comment, photos });
      }).catch(err => {
        console.error('Error processing images:', err);
        alert('Error processing images. Please try again.');
      });
      return;
    }
    onSave({ name, category: catToUse, color: colorToUse, comment, photos });
  }

  return (
    <div className="card" style={{marginTop:8}}>
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
            <optgroup label="Default Categories">
              {DEFAULT_CATEGORIES.map(c=>(<option key={c.name} value={c.name}>{c.name}</option>))}
            </optgroup>
            {customCategories.length > 0 && (
              <optgroup label="Custom Categories">
                {customCategories.map(c=>(<option key={c.name} value={c.name}>{c.name}</option>))}
              </optgroup>
            )}
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
          <label className="form-label">Photos (max 5)</label>
          <input ref={photosRef} type="file" accept="image/*" multiple className="form-control" />
          <small className="text-muted">You can upload up to 5 photos</small>
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
  );
}
