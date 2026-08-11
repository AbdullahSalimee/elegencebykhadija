// Route-level loading UI (app/shop/loading.js, app/new-in/loading.js,
// app/sale/loading.js) shown while the server-fetched product list resolves.
// Reuses the .skeleton-block/newin-pulse styles already defined in globals.css.
export default function ProductGridSkeleton({ count = 8, gridClassName = 'newin-grid' }) {
  return (
    <div className="page-body" style={{ padding: '40px 48px 72px' }}>
      <div className={gridClassName}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="skeleton-block" style={{ height: 420, marginBottom: 10 }} />
            <div className="skeleton-block" style={{ height: 12, width: '60%', marginBottom: 8 }} />
            <div className="skeleton-block" style={{ height: 18, width: '80%', marginBottom: 8 }} />
            <div className="skeleton-block" style={{ height: 14, width: '40%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
