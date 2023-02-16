import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

function LoginForm({ onSubmit, username, setUsername, password, setPassword }) {
  const handleLogin = async (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Form
      onSubmit={handleLogin}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      data-test='login-form'
    >
      <Form.Label>
        username
        <Form.Control
          type='text'
          value={username}
          name='Username'
          onChange={({ target }) => setUsername(target.value)}
          data-test='username'
        />
      </Form.Label>
      <Form.Label>
        password
        <Form.Control
          type='password'
          value={password}
          name='Password'
          onChange={({ target }) => setPassword(target.value)}
          data-test='password'
        />
      </Form.Label>
      <Button type='submit'>login</Button>
    </Form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
};

export default LoginForm;
