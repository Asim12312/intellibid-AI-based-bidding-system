import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
// import userRoutes from '../modules/user/user.routes.js';
// import productRoutes from '../modules/product/product.routes.js';
// import bidRoutes from '../modules/bid/bid.routes.js';

const router = Router();

router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// router.use('/bids', bidRoutes);

export default router;
