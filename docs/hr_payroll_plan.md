# HR & Payroll Implementation Plan

## 1. Goal
Add a full HR/Payroll/Attendance module to the admin with mobile-app employee onboarding, role-based access, payroll automation, advances & pending amounts tracking, approvals, documents/KYC, integrations, audit trails and complete reporting.

## 2. Roles & Permissions (RBAC)
- **HR Admin**: Full HR CRUD, payroll run, approve leaves/advances.
- **Payroll Admin / Finance**: Payroll, tax, payouts, reconciliations.
- **Manager**: Team view, approve leaves/attendance/expenses.
- **Employee (Mobile App)**: View payslips, apply leave, request advance.
- **Super Admin**: Global settings.

## 3. Core Features
1.  **Employee Master**: Personal, professional, docs, bank details.
2.  **Organization**: Designations, Departments, Locations, Teams.
3.  **Salary Model**: Components, Structure, Templates.
4.  **Pending Amounts Ledger**: Advances, Reimbursements, Due Salary.
5.  **Payroll Engine**: Runs, Previews, Revisions, Arrears, Payslips (PDF).
6.  **Attendance**: Biometric, Mobile Geofence, Manual. Shift scheduling.
7.  **Leave Management**: Types, Accruals, Approvals.
8.  **Expense Claims**: Submission, Verification, Reimbursement.
9.  **Advances & Loans**: Request, Approval, Recovery Schedule.
10. **Tax & Statutory**: TDS, PF, ESIC, Professional Tax.
11. **Payouts**: Bank/UPI bulk payouts (RazorpayX/Bank File).
12. **Documents & KYC**: ID, PAN, Aadhar, License management.
13. **Mobile App**: Onboarding (OTP), Device Binding, Self-service.
14. **Notifications**: Email, SMS, WhatsApp, Push.
15. **Audit Logs**: Comprehensive tracking of all actions.
16. **Reports**: Payroll register, Headcount, Compliance.
17. **Integrations**: Accounting, Biometric, Banks.

## 4. Employee Master Fields
-   ID, Name, DOB, Gender, Contact.
-   Address, Bank Details, UPI.
-   PAN, Aadhaar (Encrypted).
-   Designation, Dept, Manager, Location.
-   Employment Type, Dates (Joining, Exit).
-   Salary Structure Link.
-   Shift Schedule.
-   Documents (Offer letter, etc.).
-   Mobile Device Metadata.

## 5. Salary & Pending Amounts
-   **Templates**: Components (Earnings/Deductions), Formulas.
-   **Pending Amounts Ledger**: Track advances, loans, reimbursements.
-   **Recovery**: Auto-deduction schedules.

## 6. Payroll Engine
-   Preview -> Approve -> Finalize -> Payout.
-   Supports retro adjustments, off-cycle pays, rollbacks.
-   Generates Payslips (PDF) & Bank Files.

## 7. Attendance & Shifts
-   Biometric / Geofence / Manual.
-   Shift Templates, Overtime Rules.
-   Exception Handling (Late/Absent).

## 8. Leave Management
-   Types, Accruals, Carry-forward, Encashment.
-   Approval Workflows.

## 9. Mobile App Flow
1.  Admin invites employee (Phone/Link).
2.  App Download -> OTP Verify -> Device Binding.
3.  Features: Payslips, Leave, Attendance, Advances, Chat.

## 10. Admin UI Pages
-   **Employees**: List, Profile (Tabs for all details).
-   **Payroll**: Runs, Previews, Approvals.
-   **Attendance**: Dashboard, Corrections.
-   **Leaves/Advances/Expenses**: Approval Queues.
-   **Reports**: Registers, Statutory, Headcount.
-   **Settings**: Config, Templates.

## 11. Admin APIs (Summary)
-   `GET /admin/employees`, `POST /admin/employees`
-   `GET /admin/employees/:id/pending-amounts`
-   `POST /admin/payslips/generate`, `POST /admin/payslips/finalize`
-   `POST /admin/attendance/import`
-   `POST /admin/leave/:id/approve`
-   `POST /admin/payouts/create-batch`

## 12. Implementation Roadmap (Sprints)
-   **Sprint 0**: Infra, Auth, Employee Master, Mobile Invite.
-   **Sprint 1**: Salary Templates, Payroll Preview, Payslips.
-   **Sprint 2**: Attendance, Leave Approvals.
-   **Sprint 3**: Advances, Expense Claims.
-   **Sprint 4**: Payouts (RazorpayX), Final Payroll, Tax.
-   **Sprint 5**: Mobile App Features.
-   **Sprint 6**: Integrations, Reporting, Launch.
