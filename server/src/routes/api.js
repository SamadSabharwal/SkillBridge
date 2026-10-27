import { Router } from 'express';
import { registerAuthRoutes } from './modules/auth.js';
import { registerProjectsRoutes } from './modules/projects.js';
import { registerProposalsRoutes } from './modules/proposals.js';
import { registerContractsRoutes } from './modules/contracts.js';
import { registerServicesRoutes } from './modules/services.js';
import { registerOrdersRoutes } from './modules/orders.js';
import { registerFreelancersRoutes } from './modules/freelancers.js';
import { registerDashboardRoutes } from './modules/dashboard.js';
import { registerReviewsRoutes } from './modules/reviews.js';
import { registerMessagesRoutes } from './modules/messages.js';
import { registerPaymentsRoutes } from './modules/payments.js';

const router = Router();

registerAuthRoutes(router);
registerProjectsRoutes(router);
registerProposalsRoutes(router);
registerContractsRoutes(router);
registerServicesRoutes(router);
registerOrdersRoutes(router);
registerFreelancersRoutes(router);
registerDashboardRoutes(router);
registerReviewsRoutes(router);
registerMessagesRoutes(router);
registerPaymentsRoutes(router);

export default router;
