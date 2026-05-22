import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="auth-page">
    <div className="auth-form">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="button button-secondary">
        Return to dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
