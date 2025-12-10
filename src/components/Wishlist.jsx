import { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';

const WISHLIST_STORAGE_KEY = 'dots_wishlist';

export default function Wishlist() {
    const [user, setUser] = useState(getCurrentUser());
    const [wishlistItems, setWishlistItems] = useState([]);
    const [newPlace, setNewPlace] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, visited

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
            loadWishlist(currentUser.email);
        }

        const handleAuthChange = () => {
            const updatedUser = getCurrentUser();
            setUser(updatedUser);
            if (updatedUser) {
                loadWishlist(updatedUser.email);
            } else {
                setWishlistItems([]);
            }
        };

        window.addEventListener('authChanged', handleAuthChange);
        return () => window.removeEventListener('authChanged', handleAuthChange);
    }, []);

    function loadWishlist(userEmail) {
        try {
            const allWishlists = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
            const userWishlist = allWishlists[userEmail] || [];
            setWishlistItems(userWishlist);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            setWishlistItems([]);
        }
    }

    function saveWishlist(items) {
        if (!user) return;
        try {
            const allWishlists = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
            allWishlists[user.email] = items;
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(allWishlists));
            setWishlistItems(items);
        } catch (error) {
            console.error('Error saving wishlist:', error);
            alert('Failed to save wishlist. Please try again.');
        }
    }

    function handleAddPlace(e) {
        e.preventDefault();
        if (!newPlace.trim()) return;

        const newItem = {
            id: Date.now(),
            place: newPlace.trim(),
            description: newDescription.trim(),
            status: 'pending', // pending or visited
            createdAt: new Date().toISOString(),
            visitedAt: null
        };

        saveWishlist([...wishlistItems, newItem]);
        setNewPlace('');
        setNewDescription('');
    }

    function toggleVisited(itemId) {
        const updatedItems = wishlistItems.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    status: item.status === 'visited' ? 'pending' : 'visited',
                    visitedAt: item.status === 'visited' ? null : new Date().toISOString()
                };
            }
            return item;
        });
        saveWishlist(updatedItems);
    }

    function deleteItem(itemId) {
        if (window.confirm('Remove this place from your wishlist?')) {
            saveWishlist(wishlistItems.filter(item => item.id !== itemId));
        }
    }

    if (!user) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">
                    Please log in to manage your travel wishlist.
                </div>
            </div>
        );
    }

    const filteredItems = wishlistItems.filter(item => {
        if (filter === 'all') return true;
        return item.status === filter;
    });

    const stats = {
        total: wishlistItems.length,
        pending: wishlistItems.filter(i => i.status === 'pending').length,
        visited: wishlistItems.filter(i => i.status === 'visited').length,
        progress: wishlistItems.length > 0 
            ? Math.round((wishlistItems.filter(i => i.status === 'visited').length / wishlistItems.length) * 100)
            : 0
    };

    return (
        <div className="container py-4">
            <h1 className="mb-4">Travel Wishlist 🌍</h1>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h2 style={{color: '#D4A574', fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.total}</h2>
                            <p className="text-muted mb-0">Total Places</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h2 style={{color: '#ffc107', fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.pending}</h2>
                            <p className="text-muted mb-0">To Visit</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h2 style={{color: '#28a745', fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.visited}</h2>
                            <p className="text-muted mb-0">Visited</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h2 style={{color: '#D4A574', fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.progress}%</h2>
                            <p className="text-muted mb-0">Progress</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Add New Place Form */}
                <div className="col-md-4 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h5 mb-3">Add to Wishlist</h2>
                            <form onSubmit={handleAddPlace}>
                                <div className="mb-3">
                                    <label className="form-label">Place Name *</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Paris, France"
                                        value={newPlace}
                                        onChange={(e) => setNewPlace(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Why visit?</label>
                                    <textarea 
                                        className="form-control"
                                        rows={3}
                                        placeholder="What attracts you to this place?"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Add to Wishlist
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Wishlist Items */}
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h5 mb-0">My Places</h2>
                                <div className="btn-group btn-group-sm">
                                    <button 
                                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button 
                                        className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                                        onClick={() => setFilter('pending')}
                                    >
                                        To Visit ({stats.pending})
                                    </button>
                                    <button 
                                        className={`btn ${filter === 'visited' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setFilter('visited')}
                                    >
                                        Visited ({stats.visited})
                                    </button>
                                </div>
                            </div>

                            {filteredItems.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    {filter === 'all' ? (
                                        <div>
                                            <p className="h4">✨ Start Your Dream List!</p>
                                            <p>Add places you want to visit to your wishlist.</p>
                                        </div>
                                    ) : filter === 'pending' ? (
                                        <p>No pending places. Add some dream destinations!</p>
                                    ) : (
                                        <p>No visited places yet. Start checking off your wishlist!</p>
                                    )}
                                </div>
                            ) : (
                                <div className="list-group">
                                    {filteredItems.map(item => (
                                        <div 
                                            key={item.id} 
                                            className={`list-group-item ${item.status === 'visited' ? 'list-group-item-success' : ''}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <input 
                                                            type="checkbox"
                                                            className="form-check-input me-2"
                                                            checked={item.status === 'visited'}
                                                            onChange={() => toggleVisited(item.id)}
                                                            style={{cursor: 'pointer'}}
                                                        />
                                                        <h3 className={`h6 mb-0 ${item.status === 'visited' ? 'text-decoration-line-through' : ''}`}>
                                                            {item.place}
                                                        </h3>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-muted small mb-1 ms-4">{item.description}</p>
                                                    )}
                                                    <div className="small text-muted ms-4">
                                                        {item.status === 'visited' ? (
                                                            <span className="text-success">
                                                                ✓ Visited {new Date(item.visitedAt).toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                Added {new Date(item.createdAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => deleteItem(item.id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
