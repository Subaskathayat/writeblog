export default function Spinner({ full = false }) {
  if (full) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }
  return <div className="spinner" />;
}
