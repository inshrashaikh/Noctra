import { Capacitor } from '@capacitor/core';
import {
  createRouter,
  createRootRoute,
  createRoute,
  createHashHistory,
  Outlet,
} from '@tanstack/react-router';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { AppShell } from '@/layouts/AppShell';
import { LandingPage } from '@/routes/LandingPage';
import { DashboardPage } from '@/routes/DashboardPage';
import { PlannerPage } from '@/routes/PlannerPage';
import { ServicesPage } from '@/routes/ServicesPage';
import { AboutPage } from '@/routes/AboutPage';
import { TokensPage } from '@/routes/TokensPage';

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
});

// Marketing layout route (landing, about, tokens)
const marketingRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'marketing',
  component: MarketingLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => marketingRoute,
  path: '/',
  component: LandingPage,
});

const tokensRoute = createRoute({
  getParentRoute: () => marketingRoute,
  path: '/tokens',
  component: TokensPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => marketingRoute,
  path: '/about',
  component: AboutPage,
});

// App layout route (dashboard, planner, services)
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppShell,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const plannerRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/planner',
  component: PlannerPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/services',
  component: ServicesPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  marketingRoute.addChildren([landingRoute, tokensRoute, aboutRoute]),
  appRoute.addChildren([dashboardRoute, plannerRoute, servicesRoute]),
]);

// Hash history is required inside the Android WebView so client routes
// resolve from the bundled index.html instead of a missing native path.
export const router = createRouter({
  routeTree,
  ...(Capacitor.isNativePlatform() ? { history: createHashHistory() } : {}),
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
