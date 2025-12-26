import * as React from 'react';
import { navigate } from 'gatsby';

// Catch-all route that redirects to 404 page
const CatchAllPage = () => {
  React.useEffect(() => {
    // Redirect to custom 404 page
    navigate('/404', { replace: true });
  }, []);

  return null;
};

export default CatchAllPage;
