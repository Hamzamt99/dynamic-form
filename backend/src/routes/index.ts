import { Router } from 'express';
import { DynamicFormsController } from '../modules/dynamic-forms/controller';

const router = Router();
const dynamicController = new DynamicFormsController()

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

router.use('/dynamic-forms', dynamicController.getRouter());

export default router;