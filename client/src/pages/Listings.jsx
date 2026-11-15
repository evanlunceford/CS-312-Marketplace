import React, { useEffect, useState } from 'react';
import { listingApi } from '../api/listingApi';
import { useAuth } from '../context/AuthContext';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await listingApi.getAll();
      setListings(res.data);
    } catch (err) {
      setError('Failed to load listings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await listingApi.create(form);
      setForm({ title: '', description: '', price: '', category: '' });
      loadListings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  const handleDelete = async (id) => {
    try {
      await listingApi.delete(id);
      loadListings();
    } catch (err) {
      setError('Failed to delete listing');
    }
  };

  return (
    <div className="listings-page" style={{ padding: '20px' }}>
      <h2>Marketplace Listings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <h3>Create New Listing</h3>
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <button type="submit">Add Listing</button>
        </form>
      )}

      <div className="listing-grid">
        {listings.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Seller:</strong> {item.seller_name}</p>
            {user && user.id === item.user_id && (
              <button onClick={() => handleDelete(item.id)} style={{ background: 'red', color: 'white' }}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
