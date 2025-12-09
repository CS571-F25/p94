import { useState } from 'react'
import thankYouImg from '../assets/ThankYou.png'

export default function Contact(){
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [sent, setSent] = useState(false)

    function validate(){
        const e = {}
        if(!name.trim()) e.name = 'Name is required.'
        if(!email.trim()) e.email = 'Email is required.'
        else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Email is invalid.'
        if(!message.trim()) e.message = 'Message cannot be empty.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    function onSubmit(ev){
        ev.preventDefault()
        if(!validate()) return
        // Simulate send
        setSent(true)
        setName('')
        setEmail('')
        setMessage('')
        setTimeout(()=>setSent(false), 4000)
    }

    return (
        <div className="container py-4">
            <div className="row align-items-center">
                <div className="col-md-6">
                    <h2>Contact</h2>
                    <p className="lead mb-4">
                        We'd love to hear from you! Whether you have suggestions, complaints, or just want to get in touch, feel free to submit this form.
                    </p>
                </div>
                <div className="col-md-6 text-center mb-4">
                    <img src={thankYouImg} alt="Thank You" style={{maxWidth: '250px', width: '100%', height: 'auto'}} />
                </div>
            </div>
            <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className={`form-control ${errors.name? 'is-invalid':''}`} value={name} onChange={e=>setName(e.target.value)} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className={`form-control ${errors.email? 'is-invalid':''}`} value={email} onChange={e=>setEmail(e.target.value)} />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea className={`form-control ${errors.message? 'is-invalid':''}`} rows={6} value={message} onChange={e=>setMessage(e.target.value)} />
                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                </div>
                <button className="btn btn-primary" type="submit">Send</button>
                {sent && <div className="alert alert-success mt-3">Message sent (simulated)</div>}
            </form>
            <div className="mt-5 pt-4 border-top">
                <p className="text-muted mb-1">You can also reach me directly at:</p>
                <p className="mb-0">
                    <a href="mailto:Camilla021015@gmail.com" className="text-decoration-none">Camilla021015@gmail.com</a>
                </p>
            </div>
        </div>
    )
}
