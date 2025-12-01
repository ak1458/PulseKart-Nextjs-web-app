import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';

const router = Router();

router.get('/', EmployeeController.getEmployees);
router.post('/', EmployeeController.createEmployee);
router.put('/:id', EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);

export default router;
