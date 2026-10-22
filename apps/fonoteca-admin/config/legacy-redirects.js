// Rutas anteriores de Colecciones/Eventos y su destino canónico bajo /dashboard/monitoring.
// Las más específicas van primero. Se mantienen mientras existan enlaces guardados o externos.
export const legacyRedirects = [
  { source: "/dashboard/collections", destination: "/dashboard/monitoring/register" },
  { source: "/dashboard/collections/new", destination: "/dashboard/monitoring/register" },
  { source: "/dashboard/collections/events", destination: "/dashboard/monitoring/events" },
  { source: "/dashboard/collections/events/new", destination: "/dashboard/monitoring/register/events/new" },
  {
    source: "/dashboard/collections/events/:id/occurrences",
    destination: "/dashboard/monitoring/register/events/:id/occurrences",
  },
  { source: "/dashboard/collections/occurrences", destination: "/dashboard/occurrences" },
  {
    source: "/dashboard/collections/occurrences/new",
    destination: "/dashboard/monitoring/register/occurrences/new",
  },
  {
    source: "/dashboard/collections/occurrences/:id/multimedia",
    destination: "/dashboard/monitoring/register/occurrences/:id/multimedia",
  },
  { source: "/dashboard/events", destination: "/dashboard/monitoring/events" },
  { source: "/dashboard/events/new", destination: "/dashboard/monitoring/events/new" },
  { source: "/dashboard/events/:id/edit", destination: "/dashboard/monitoring/events/:id/edit" },
  { source: "/dashboard/events/:id", destination: "/dashboard/monitoring/events" },
];
