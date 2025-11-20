import { useEffect, useState } from 'react'
import { getCurrentUser, logout } from '../utils/auth'

export default function NavBar(){
    const [user, setUser] = useState(getCurrentUser())

    useEffect(()=>{
        function onAuth(){ setUser(getCurrentUser()) }
        window.addEventListener('authChanged', onAuth)
        window.addEventListener('storage', onAuth)
        return ()=>{
            window.removeEventListener('authChanged', onAuth)
            window.removeEventListener('storage', onAuth)
        }
    },[])

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <a className="navbar-brand" href="#/">Dot the World</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navmenu">
                    <ul className="navbar-nav ms-auto align-items-center">
                                                {!user ? (
                                                        <li className="nav-item"><a className="nav-link" href="#/">Home</a></li>
                                                ) : (
                                                        <>
                                                                <li className="nav-item"><a className="nav-link" href="#/">Home</a></li>
                                                                <li className="nav-item"><a className="nav-link" href="#/map">Map</a></li>
                                                                {/* <li className="nav-item"><a className="nav-link" href="#/projects">Projects</a></li> */}
                                                                <li className="nav-item"><a className="nav-link" href="#/about">About</a></li>
                                                                <li className="nav-item"><a className="nav-link" href="#/contact">Contact</a></li>
                                                                <li className="nav-item ms-3"><span className="text-light">Hi, {user.name}</span></li>
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
