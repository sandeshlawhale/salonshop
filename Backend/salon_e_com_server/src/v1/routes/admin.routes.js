import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/payouts', adminController.getPayoutRequests);
router.post('/payouts/:id/approve', adminController.approvePayout);

router.get('/commission-slabs', adminController.getSlabs);
router.put('/commission-slabs/:id', adminController.updateSlab);


export default router;
