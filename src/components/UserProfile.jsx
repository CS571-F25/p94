import { useState, useEffect } from 'react'
import { useParams } from 'react-router'

const PROFILES_STORAGE_KEY = 'dots_user_profiles';
const PINS_STORAGE_KEY = 'dots_pins_v2';

export default function UserProfile() {
    const { email } = useParams()
    const [userProfile, setUserProfile] = useState(null)
    const [userPins, setUserPins] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!email) return;
        
        const decodedEmail = decodeURIComponent(email);
        
        // Load user profile
        const allProfiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}')
        const profile = allProfiles[decodedEmail]
        
        // Load all pins filtered by user
        const pinsData = localStorage.getItem(PINS_STORAGE_KEY)
        let filteredPins = []
        
        if (pinsData) {
            const allPins = JSON.parse(pinsData)
            filteredPins = allPins.filter(pin => pin.author && pin.author.email === decodedEmail)
            setUserPins(filteredPins)
        }
        
        // Set profile from storage or from first pin
        if (profile) {
            setUserProfile(profile)
        } else if (filteredPins.length > 0 && filteredPins[0].author) {
            setUserProfile({
                name: filteredPins[0].author.name,
                email: filteredPins[0].author.email,
                profilePic: '',
                description: ''
            })
        }
        
        setLoading(false)
    }, [email])

    if (loading) {
        return (
            <div className="container py-4">
                <p>Loading...</p>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">
                    User not found or no pins available.
                </div>
                <a href="#/" className="btn btn-secondary">Back to Home</a>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <div className="mb-3">
                <a href="#/map" className="btn btn-sm btn-outline-secondary">← Back to Map</a>
            </div>
            
            <div className="row">
                <div className="col-md-4">
                    <div className="card p-4 text-center">
                        <div className="mb-3">
                            {userProfile.profilePic ? (
                                <img 
                                    src={userProfile.profilePic} 
                                    alt={userProfile.name}
                                    style={{
                                        width: '120px', 
                                        height: '120px', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '3px solid #D4A574',
                                        margin: '0 auto',
                                        display: 'block'
                                    }}
                                />
                            ) : (
                                <div 
                                    style={{
                                        width: '120px', 
                                        height: '120px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        border: '3px solid #D4A574',
                                        fontSize: '2.5rem',
                                        color: '#D4A574'
                                    }}
                                >
                                    {userProfile.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h4>{userProfile.name}</h4>
                        <p className="text-muted small mb-3">{userProfile.email}</p>
                        
                        {userProfile.description && (
                            <div className="mb-3 p-3 bg-light rounded text-start">
                                <h6>About</h6>
                                <p className="small mb-0">{userProfile.description}</p>
                            </div>
                        )}
                        
                        <div className="mt-3 p-3 bg-light rounded">
                            <h6>Travel Stats</h6>
                            <div className="d-flex justify-content-around mt-2">
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#D4A574'}}>
                                        {userPins.length}
                                    </div>
                                    <div className="small text-muted">Places</div>
                                </div>
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#D4A574'}}>
                                        {new Set(userPins.map(p => p.category)).size}
                                    </div>
                                    <div className="small text-muted">Categories</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-8">
                    <div className="card p-4">
                        <h5 className="mb-3">{userProfile.name}'s Places ({userPins.length})</h5>
                        <div className="row">
                            {userPins.length === 0 ? (
                                <div className="col-12">
                                    <p className="text-muted text-center py-4">
                                        No places shared yet.
                                    </p>
                                </div>
                            ) : (
                                userPins.map((pin) => (
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
                                                        {pin.comment.substring(0, 100)}
                                                        {pin.comment.length > 100 ? '...' : ''}
                                                    </p>
                                                )}
                                                {pin.photos && pin.photos.length > 0 && (
                                                    <div className="mt-2">
                                                        {pin.photos.slice(0, 3).map((photo, i) => (
                                                            <img 
                                                                key={i} 
                                                                src={photo} 
                                                                alt="Place" 
                                                                style={{
                                                                    width: '60px', 
                                                                    height: '60px', 
                                                                    objectFit: 'cover', 
                                                                    marginRight: '4px',
                                                                    borderRadius: '4px'
                                                                }} 
                                                            />
                                                        ))}
                                                    </div>
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
