import { useEffect, useState } from 'react'
import { getCurrentUser, logout } from '../utils/auth'
import logo from '../assets/DotTheWorld.png'

export default function NavBar(){
    const [user, setUser] = useState(getCurrentUser())
    const [userProfile, setUserProfile] = useState(null)
    const [currentPage, setCurrentPage] = useState('Home')

    useEffect(()=>{
        function onAuth(){ 
            const currentUser = getCurrentUser()
            setUser(currentUser)
            if (currentUser) {
                loadUserProfile(currentUser.email)
            } else {
                setUserProfile(null)
            }
        }
        onAuth()
        window.addEventListener('authChanged', onAuth)
        window.addEventListener('storage', onAuth)
        return ()=>{
            window.removeEventListener('authChanged', onAuth)
            window.removeEventListener('storage', onAuth)
        }
    },[])

    function loadUserProfile(email) {
        try {
            const profiles = JSON.parse(localStorage.getItem('dots_user_profiles') || '{}')
            setUserProfile(profiles[email] || null)
        } catch (error) {
            console.error('Error loading profile:', error)
            setUserProfile(null)
        }
    }

    useEffect(() => {
        function updatePage() {
            const hash = window.location.hash
            if (hash === '#/' || hash === '') setCurrentPage('Home')
            else if (hash === '#/map') setCurrentPage('Map')
            else if (hash === '#/profile') setCurrentPage('Me')
            else if (hash === '#/wishlist') setCurrentPage('Wishlist')
            else if (hash === '#/contact') setCurrentPage('Contact')
            else if (hash === '#/projects') setCurrentPage('Projects')
        }
        updatePage()
        window.addEventListener('hashchange', updatePage)
        return () => window.removeEventListener('hashchange', updatePage)
    }, [])

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary" style={{padding: '0.5rem 1rem'}}>
            <div className="container-fluid" style={{padding: 0}}>
                <a className="navbar-brand d-flex align-items-center" href="#/" style={{margin: 0, gap: '0.5rem'}}>
                    <img src={logo} alt="Logo" style={{width: '32px', height: '32px'}} />
                    <span>Dot the World <span style={{fontSize: '0.9rem', opacity: 0.8}}>| {currentPage}</span></span>
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navmenu">
                    <ul className="navbar-nav ms-auto align-items-center" style={{gap: '0.5rem'}}>
                                                {!user ? (
                                                        <li className="nav-item"><a className="nav-link" href="#/">Home</a></li>
                                                ) : (
                                                        <>
                                                                <li className="nav-item"><a className="nav-link" href="#/">Home</a></li>
                                                                <li className="nav-item"><a className="nav-link" href="#/map">Map</a></li>
                                                                <li className="nav-item"><a className="nav-link" href="#/wishlist">Wishlist</a></li>
                                                                {/* <li className="nav-item"><a className="nav-link" href="#/projects">Projects</a></li> */}
                                                                <li className="nav-item"><a className="nav-link" href="#/contact">Contact</a></li>
                                                                <li className="nav-item ms-3"><span className="text-light">Hi, {user.name}</span></li>
                                                                <li className="nav-item ms-2">
                                                                    <a href="#/profile" style={{textDecoration: 'none'}}>
                                                                        <img 
                                                                            src={userProfile?.profilePic || logo} 
                                                                            alt="Profile"
                                                                            style={{
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                borderRadius: '50%',
                                                                                objectFit: 'cover',
                                                                                border: '2px solid white',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        />
                                                                    </a>
                                                                </li>
                                                                <li className="nav-item ms-2"><button className="btn btn-sm btn-outline-light" onClick={() => {
                                                                    if (window.confirm('Are you sure you want to log out?')) {
                                                                        logout();
                                                                        window.location.hash = '#/';
                                                                        window.location.reload();
                                                                    }
                                                                }}>Logout</button></li>
                                                        </>
                                                )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}
