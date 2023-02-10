import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function Root() {
  const [page, setPage] = useState('authors');
  const navigate = useNavigate();
  return (
    <>
      <div>
        <button onClick={() => navigate('/')}>home</button>
        <button onClick={() => navigate('/authors')}>authors</button>
        <button onClick={() => navigate('/books')}>books</button>
        <button onClick={() => navigate('/addbook')}>add book</button>
      </div>
      <Outlet />
    </>
  );
}
