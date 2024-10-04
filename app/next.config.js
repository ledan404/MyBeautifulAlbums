module.exports = (phase) => {
  const nextConfig = {
    output: phase === 'phase-production-build' ? 'export' : 'standalone',
  };
  return nextConfig;
};
