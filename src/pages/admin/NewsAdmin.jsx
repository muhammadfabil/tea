import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pastikan URL menggunakan HTTPS
        const response = await axios.get('https://ec2-13-236-194-123.ap-southeast-2.compute.amazonaws.com/news');
        setNews(response.data);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Gagal memuat berita. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <p>Memuat berita...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Daftar Berita</h1>
      {news.length === 0 ? (
        <p>Tidak ada berita tersedia.</p>
      ) : (
        <ul>
          {news.map((item) => (
            <li key={item.news_id} style={{ border: '1px solid #ccc', marginBottom: '16px', padding: '16px' }}>
              <h2>{item.title}</h2>
              {item.picture_url && (
                <img
                  src={item.picture_url}
                  alt={item.picture_description || 'Gambar berita'}
                  style={{ maxWidth: '100%', height: 'auto', marginBottom: '8px' }}
                />
              )}
              <p><strong>Subjudul:</strong> {item.subtitle || 'Tidak ada subjudul'}</p>
              <p><strong>Penulis:</strong> {item.author_name}</p>
              {item.author_email && (
                <p>
                  <strong>Email Penulis:</strong>{' '}
                  <a href={`mailto:${item.author_email}`}>{item.author_email}</a>
                </p>
              )}
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Dibuat pada:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
              {item.update_at && (
                <p><strong>Diperbarui pada:</strong> {new Date(item.update_at).toLocaleDateString()}</p>
              )}
              <p><strong>Konten:</strong> {item.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsList;