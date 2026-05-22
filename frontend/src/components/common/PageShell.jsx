import Navbar from './Navbar';

const PageShell = ({ title, children, description }) => (
  <div className="page-shell">
    <Navbar />
    <main className="page-content">
      <section className="page-header">
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </section>
      <div className="page-body">{children}</div>
    </main>
  </div>
);

export default PageShell;
