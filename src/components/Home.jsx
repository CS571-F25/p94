import { useEffect, useState } from 'react'
import { login, signup, getCurrentUser } from '../utils/auth'

export default function Home() {
        const [mode, setMode] = useState('login') // 'login' or 'signup'
        const [error, setError] = useState('')
        const [user, setUser] = useState(getCurrentUser())

        useEffect(()=>{
            function onAuth(){ setUser(getCurrentUser()) }
            window.addEventListener('authChanged', onAuth)
            window.addEventListener('storage', onAuth)
            return ()=>{ window.removeEventListener('authChanged', onAuth); window.removeEventListener('storage', onAuth) }
        },[])

        async function handleLogin(e){
            e.preventDefault(); setError('')
            const fd = new FormData(e.target)
            try{
                login({email: fd.get('email'), password: fd.get('password')})
            }catch(err){ setError(err.message); return }
            setUser(getCurrentUser())
            // navigate to map
            window.location.hash = '#/map'
        }

        async function handleSignup(e){
            e.preventDefault(); setError('')
            const fd = new FormData(e.target)
            const name = fd.get('name')
            const email = fd.get('email')
            const password = fd.get('password')
            try{
                signup({name,email,password})
            }catch(err){ setError(err.message); return }
            setUser(getCurrentUser())
            window.location.hash = '#/map'
        }

        if(user){
            return (
                <div className="container py-4">
                    <div className="p-4 bg-light rounded-3">
                        <h1>Welcome back, {user.name}!</h1>
                        <p className="lead">You're signed in. Visit the Map to start pinning your travels.</p>
                        <button className="btn btn-primary" onClick={() => { window.location.hash = '#/map'; }}>Open Map</button>
                    </div>
                </div>
            )
        }

        return (
                <div className="container py-4">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="p-4 bg-light rounded-3">
                                    <h2>{mode==='login'?'Login':'Sign up'}</h2>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    {mode==='login' ? (
                                        <form onSubmit={handleLogin}>
                                            <div className="mb-2">
                                                <label className="form-label">Email</label>
                                                <input name="email" type="email" className="form-control" required />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Password</label>
                                                <input name="password" type="password" className="form-control" required />
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-primary">Login</button>
                                                <button type="button" className="btn btn-link" onClick={()=>setMode('signup')}>Create account</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleSignup}>
                                            <div className="mb-2">
                                                <label className="form-label">Name</label>
                                                <input name="name" className="form-control" required />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Email</label>
                                                <input name="email" type="email" className="form-control" required />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Password</label>
                                                <input name="password" type="password" className="form-control" required />
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-primary">Sign up</button>
                                                <button type="button" className="btn btn-link" onClick={()=>setMode('login')}>Have an account? Login</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-4">
                                    <h3>About Dot the World</h3>
                                    <p>
                                        Dot the World is a personal travel-journal map. Sign up to drop pins, add photos and tips, and build a visual record of your travels.
                                    </p>
                                </div>
                            </div>
                        </div>
                </div>
        )
}