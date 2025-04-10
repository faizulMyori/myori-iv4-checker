import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import HomePage from "../pages/HomePage";
import InventoryPage from "../pages/InventoryPage";
import ProductionPage from "@/pages/production/page";
import HistoryPage from "@/pages/history/page";
import SettingPage from "@/pages/SettingPage";
import LicensePage from "@/pages/LicensePage";

// TODO: Steps to add a new route:
// 1. Create a new page component in the '../pages/' directory (e.g., NewPage.tsx)
// 2. Import the new page component at the top of this file
// 3. Define a new route for the page using createRoute()
// 4. Add the new route to the routeTree in RootRoute.addChildren([...])
// 5. Add a new Link in the navigation section of RootRoute if needed

// Example of adding a new route:
// 1. Create '../pages/NewPage.tsx'
// 2. Import: import NewPage from '../pages/NewPage';
// 3. Define route:
//    const NewRoute = createRoute({
//      getParentRoute: () => RootRoute,
//      path: '/new',
//      component: NewPage,
//    });
// 4. Add to routeTree: RootRoute.addChildren([HomeRoute, NewRoute, ...])
// 5. Add Link: <Link to="/new">New Page</Link>

export const HomeRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
});

export const InventoryRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/inventory",
  component: InventoryPage,
});

export const ProductionRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/production",
  component: ProductionPage,
});

export const LicenseRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/license",
  component: LicensePage,
});

export const HistoryRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/history",
  component: HistoryPage,
});

export const SettingRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/setting",
  component: SettingPage,
});

export const rootTree = RootRoute.addChildren([HomeRoute, InventoryRoute, ProductionRoute, HistoryRoute, SettingRoute, LicenseRoute]);
