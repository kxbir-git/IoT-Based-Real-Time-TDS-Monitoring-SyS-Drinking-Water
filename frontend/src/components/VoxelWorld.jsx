export default function VoxelWorld({ night = false }) {
  return (
    <div className={`voxel-world ${night ? 'is-night' : ''}`} aria-hidden>
      <div className="voxel-sky">
        <div className="voxel-sun" />
        <div className="voxel-moon" />
        <div className="voxel-stars" />
        <div className="voxel-cloud c1" />
        <div className="voxel-cloud c2" />
        <div className="voxel-cloud c3" />
      </div>
      <div className="voxel-terrain">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className={`voxel-col ${i % 7 === 0 ? 'water' : i % 11 === 0 ? 'sand' : 'grass'}`}
            style={{ animationDelay: `${(i % 12) * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}
