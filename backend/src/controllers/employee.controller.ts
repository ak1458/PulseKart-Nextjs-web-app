import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';

export class EmployeeController {

    static async getEmployees(req: Request, res: Response) {
        try {
            const { search, department, status } = req.query;
            const employees = await EmployeeService.getEmployees(
                String(search || ''),
                String(department || ''),
                String(status || '')
            );
            res.json(employees);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createEmployee(req: Request, res: Response) {
        try {
            const employee = await EmployeeService.createEmployee(req.body);
            res.json(employee);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateEmployee(req: Request, res: Response) {
        try {
            const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
            res.json(employee);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteEmployee(req: Request, res: Response) {
        try {
            await EmployeeService.deleteEmployee(req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
