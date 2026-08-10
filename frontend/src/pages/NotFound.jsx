import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import PageShell from '../components/PageShell.jsx';

export default function NotFound() {
  return (
    <PageShell title="Page not found" description="The route you requested does not exist.">
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </PageShell>
  );
}

