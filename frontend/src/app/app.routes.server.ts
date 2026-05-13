import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'cours/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'cours/:slug/lecture',
    renderMode: RenderMode.Server
  },
  {
    path: 'cours/:slug/progression',
    renderMode: RenderMode.Server
  },
  {
    path: 'quiz/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'quiz/:slug/resultat',
    renderMode: RenderMode.Server
  },
  {
    path: 'certificats/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
