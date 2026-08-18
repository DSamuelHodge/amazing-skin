import { createTRPCRouter } from './init';
import { authRouter } from './routers/auth';
import { catalogRouter } from './routers/catalog';
import { cartRouter } from './routers/cart';
import { checkoutRouter } from './routers/checkout';
import { customerRouter } from './routers/customer';
import { adminRouter } from './routers/admin';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  catalog: catalogRouter,
  cart: cartRouter,
  checkout: checkoutRouter,
  customer: customerRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
