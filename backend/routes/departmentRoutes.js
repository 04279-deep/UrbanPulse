import express from 'express';
import { getDepartments, getDepartmentById } from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

export default router;
