import { http, HttpResponse } from 'msw';
import { mockPlanService } from '@/services/mock/mockPlanService';
import type { PlanRequest, ReplanRequest, ServicesRequest, SimEvent } from '@noctra/contracts';

export const handlers = [
  // POST /api/plan
  http.post('/api/plan', async ({ request }) => {
    const body = (await request.json()) as PlanRequest;
    const response = await mockPlanService.plan(body);
    return HttpResponse.json(response);
  }),

  // POST /api/replan
  http.post('/api/replan', async ({ request }) => {
    const body = (await request.json()) as ReplanRequest;
    const response = await mockPlanService.replan(body);
    return HttpResponse.json(response);
  }),

  // GET /api/services
  http.get('/api/services', async ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '21.1458');
    const lon = parseFloat(url.searchParams.get('lon') || '79.0882');
    const kindsParam = url.searchParams.get('kinds');
    const kinds = kindsParam ? (kindsParam.split(',') as any[]) : undefined;
    const radiusParam = url.searchParams.get('radius_m');
    const radius_m = radiusParam ? parseFloat(radiusParam) : undefined;

    const req: ServicesRequest = { lat, lon, kinds, radius_m };
    const services = await mockPlanService.getServices(req);
    return HttpResponse.json(services);
  }),

  // GET /api/status
  http.get('/api/status', async () => {
    const status = await mockPlanService.getStatus();
    return HttpResponse.json(status);
  }),

  // POST /api/sim/event
  http.post('/api/sim/event', async ({ request }) => {
    const event = (await request.json()) as SimEvent;
    await mockPlanService.sendSimEvent?.(event);
    return HttpResponse.json({ ok: true });
  }),
];
