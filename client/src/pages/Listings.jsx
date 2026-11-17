import { useEffect, useState } from 'react';
import { listingApi } from '../api/listingApi.js';
import { getErrorMessage } from '../api/httpClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser: user } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await listingApi.getAll();
      setListings(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      await listingApi.create(form);
      setForm({ title: '', description: '', price: '', category: '' });
      await loadListings();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await listingApi.delete(id);
      await loadListings();
    } catch (err) {
      setError(getErrorMessage(err));
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
          <input type="number" min="0" max="99999999.99" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Listing"}</button>
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
            {user && user.userId === item.user_id && (
              <button onClick={() => handleDelete(item.id)} style={{ background: 'red', color: 'white' }}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
