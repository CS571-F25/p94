import { useState, useRef, useEffect } from 'react'
import { getCurrentUser } from '../utils/auth'

const PROFILES_STORAGE_KEY = 'dots_user_profiles'; // Store all user profiles

export default function Profile() {
    const [user, setUser] = useState(getCurrentUser())
    const [profilePic, setProfilePic] = useState('')
    const [description, setDescription] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [pins, setPins] = useState([])
    const fileInputRef = useRef()
    const descriptionRef = useRef()

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        if (!currentUser) return;
        
        // Load profile data for current user
        const allProfiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}')
        const userProfile = allProfiles[currentUser.email] || {}
        setProfilePic(userProfile.profilePic || '')
        setDescription(userProfile.description || '')

        // Load all pins and filter by current user
        const pinsData = localStorage.getItem('dots_pins_v2')
        if (pinsData) {
            const allPins = JSON.parse(pinsData)
            const myPins = allPins.filter(pin => pin.author && pin.author.email === currentUser.email)
            setPins(myPins)
        }
        
        // Listen for auth changes
        const handleAuthChange = () => {
            const updatedUser = getCurrentUser();
            setUser(updatedUser);
            if (updatedUser) {
                const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}')
                const profile = profiles[updatedUser.email] || {}
                setProfilePic(profile.profilePic || '')
                setDescription(profile.description || '')
                
                const pinsData = localStorage.getItem('dots_pins_v2')
                if (pinsData) {
                    const allPins = JSON.parse(pinsData)
                    const myPins = allPins.filter(pin => pin.author && pin.author.email === updatedUser.email)
                    setPins(myPins)
                }
            }
        };
        
        window.addEventListener('authChanged', handleAuthChange);
        return () => window.removeEventListener('authChanged', handleAuthChange);
    }, [])

    function handleImageUpload(e) {
        const file = e.target.files[0]
        if (file) {
            // Create an image element to resize
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    // Create canvas to resize image
                    const canvas = document.createElement('canvas')
                    const maxSize = 200 // Max width/height
                    let width = img.width
                    let height = img.height
                    
                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width
                            width = maxSize
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height
                            height = maxSize
                        }
                    }
                    
                    canvas.width = width
                    canvas.height = height
                    
                    // Draw and compress
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)
                    
                    // Convert to compressed base64 (0.7 quality)
                    const compressedImage = canvas.toDataURL('image/jpeg', 0.7)
                    setProfilePic(compressedImage)
                    saveProfile(compressedImage, description)
                }
                img.src = e.target.result
            }
            reader.readAsDataURL(file)
        }
    }

    function handleSaveDescription() {
        const newDesc = descriptionRef.current.value
        setDescription(newDesc)
        saveProfile(profilePic, newDesc)
        setIsEditing(false)
    }

    function saveProfile(pic, desc) {
        if (!user) return;
        
        try {
            // Load all profiles
            const allProfiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}')
            
            // Update current user's profile
            allProfiles[user.email] = {
                name: user.name,
                email: user.email,
                profilePic: pic,
                description: desc
            }
            
            // Save back
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles))
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please use a smaller image or clear some data.')
            } else {
                console.error('Error saving profile:', error)
                alert('Failed to save profile. Please try again.')
            }
        }
    }

    if (!user) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">
                    Please log in to view your profile.
                </div>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-md-4">
                    <div className="card p-4 text-center">
                        <div className="mb-3">
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    style={{
                                        width: '150px', 
                                        height: '150px', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '3px solid #D4A574'
                                    }} 
                                />
                            ) : (
                                <div 
                                    style={{
                                        width: '150px', 
                                        height: '150px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        border: '3px solid #D4A574',
                                        fontSize: '3rem',
                                        color: '#D4A574'
                                    }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            style={{display: 'none'}} 
                        />
                        <button 
                            className="btn btn-sm btn-outline-secondary mb-3" 
                            onClick={() => fileInputRef.current.click()}
                        >
                            Change Photo
                        </button>
                        <h2>{user.name}</h2>
                        <p className="text-muted mb-2">
                            <i className="bi bi-envelope"></i> {user.email}
                        </p>
                        <div className="mt-3 p-3 bg-light rounded">
                            <h3>Travel Stats</h3>
                            <div className="d-flex justify-content-around mt-2">
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#D4A574'}}>{pins.length}</div>
                                    <div className="small text-muted">Places</div>
                                </div>
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#D4A574'}}>
                                        {new Set(pins.map(p => p.category)).size}
                                    </div>
                                    <div className="small text-muted">Categories</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card p-4 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="mb-0">About Me</h3>
                            {!isEditing && (
                                <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <div>
                                <textarea 
                                    ref={descriptionRef} 
                                    className="form-control mb-2" 
                                    rows={5} 
                                    defaultValue={description}
                                    placeholder="Tell us about yourself..."
                                />
                                <div className="d-flex gap-2">
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveDescription}>
                                        Save
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted">
                                {description || 'No description yet. Click Edit to add one!'}
                            </p>
                        )}
                    </div>

                    <div className="card p-4">
                        <h3 className="mb-3">My Places ({pins.length})</h3>
                        <div className="row">
                            {pins.length === 0 ? (
                                <div className="col-12">
                                    <p className="text-muted text-center py-4">
                                        No places added yet. Start exploring and drop some pins!
                                    </p>
                                </div>
                            ) : (
                                pins.map((pin) => (
                                    <div key={pin.id} className="col-md-6 mb-3">
                                        <div 
                                            className="card h-100" 
                                            style={{borderLeft: `4px solid ${pin.color || '#D4A574'}`}}
                                        >
                                            <div className="card-body">
                                                <h6 className="card-title" style={{color: pin.color || '#D4A574'}}>
                                                    {pin.name || 'Untitled'}
                                                </h6>
                                                <p className="card-text small text-muted mb-1">
                                                    {pin.locationName?.split(',').slice(0, 2).join(', ')}
                                                </p>
                                                <span 
                                                    className="badge" 
                                                    style={{
                                                        backgroundColor: pin.color || '#D4A574',
                                                        color: '#fff'
                                                    }}
                                                >
                                                    {pin.category}
                                                </span>
                                                {pin.comment && (
                                                    <p className="card-text small mt-2">
                                                        {pin.comment.substring(0, 80)}
                                                        {pin.comment.length > 80 ? '...' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
