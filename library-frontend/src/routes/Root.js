import { Button, Container } from 'react-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import LoginFormContainer from '../components/LoginForm/LoginFormContainer';

export default function Root() {
  const navigate = useNavigate();
  return (
    <Container>
      <div className='mt-5 mb-5'>
        <Button onClick={() => navigate('/')}>home</Button>
        <Button onClick={() => navigate('/authors')}>authors</Button>
        <Button onClick={() => navigate('/books')}>books</Button>
        <Button onClick={() => navigate('/addbook')}>add book</Button>
      </div>
      <LoginFormContainer />
      <div className='mt-5'>
        <Outlet />
      </div>
    </Container>
  );
}
