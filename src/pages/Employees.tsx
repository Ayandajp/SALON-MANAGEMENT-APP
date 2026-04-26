import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { UndoToast } from '../components/UndoToast';
import { getEmployees, saveEmployees } from '../utils/storage';
import { useToast } from '../hooks/useToast';
import { useUndo } from '../hooks/useUndo';
import type { Employee } from '../types';

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success } = useToast();
  const { undoItem, scheduleUndo, executeUndo, clearUndo } = useUndo<Employee>();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setIsLoading(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (editingEmployee) {
      const updated = employees.map(emp =>
        emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
      );
      setEmployees(updated);
      await saveEmployees(updated);
      success('Employee updated successfully');
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        isWorking: false,
      };
      const updated = [...employees, newEmployee];
      setEmployees(updated);
      await saveEmployees(updated);
      success(`${formData.name} added to team`);
    }

    handleCloseModal();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      phone: employee.phone,
      email: employee.email,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const employeeToDelete = employees.find(emp => emp.id === id);
    if (!employeeToDelete) return;

    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    await saveEmployees(updated);
    setDeleteConfirm(null);
    
    scheduleUndo(employeeToDelete, `${employeeToDelete.name} deleted`);
    success('Employee deleted');
  };

  const handleUndo = async () => {
    const restoredEmployee = executeUndo();
    if (restoredEmployee) {
      const updated = [...employees, restoredEmployee];
      setEmployees(updated);
      await saveEmployees(updated);
      success(`${restoredEmployee.name} restored`);
    }
  };

  const toggleWorking = async (id: string) => {
    const updated = employees.map(emp =>
      emp.id === id ? { ...emp, isWorking: !emp.isWorking } : emp
    );
    setEmployees(updated);
    await saveEmployees(updated);
    const employee = updated.find(emp => emp.id === id);
    if (employee) {
      success(`${employee.name} is now ${employee.isWorking ? 'working' : 'off duty'}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({ name: '', phone: '', email: '' });
    setErrors({});
  };

  const workingEmployees = employees.filter(emp => emp.isWorking);
  const offDutyEmployees = employees.filter(emp => !emp.isWorking);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
            Employees
          </h1>
          <Button onClick={() => setShowModal(true)} disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div className="h-20 bg-surface dark:bg-dark-border rounded animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
            Employees
          </h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <EmptyState
          icon={<Plus className="w-8 h-8" />}
          illustration="users"
          title="No employees yet"
          description="Add your first team member to start tracking sales and commissions."
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Employee
            </Button>
          }
        />

        {showModal && (
          <Modal
            isOpen
            onClose={handleCloseModal}
            title="Add Employee"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g., John Smith"
                error={errors.name}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setErrors(prev => ({ ...prev, phone: '' }));
                }}
                placeholder="e.g., 0821234567"
                error={errors.phone}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="e.g., john@example.com"
                error={errors.email}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Employee
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
          Employees
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Staff</p>
          <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            {employees.length}
          </p>
        </Card>
        <Card className="border-success/20">
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Working Now</p>
          <p className="text-h2 font-heading font-bold text-success">
            {workingEmployees.length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Off Duty</p>
          <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            {offDutyEmployees.length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Active Rate</p>
          <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            {employees.length > 0 ? Math.round((workingEmployees.length / employees.length) * 100) : 0}%
          </p>
        </Card>
      </div>

      {workingEmployees.length > 0 && (
        <div>
          <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-4">
            Working Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingEmployees.map((employee) => (
              <Card key={employee.id} className="border-success/20 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={employee.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body font-heading font-semibold text-text-primary dark:text-white truncate">
                        {employee.name}
                      </h3>
                      <Badge variant="success">Active</Badge>
                    </div>
                    {employee.phone && (
                      <p className="text-caption md:text-body text-text-secondary dark:text-gray-400 truncate">
                        {employee.phone}
                      </p>
                    )}
                    {employee.email && (
                      <p className="text-caption md:text-body text-text-secondary dark:text-gray-400 truncate">
                        {employee.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => toggleWorking(employee.id)}
                    className="flex-1"
                    aria-label={`Mark ${employee.name} as off duty`}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Clock Out
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(employee)}
                    className="!px-3"
                    aria-label={`Edit ${employee.name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteConfirm(employee.id)}
                    className="!px-3"
                    aria-label={`Delete ${employee.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {offDutyEmployees.length > 0 && (
        <div>
          <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-4">
            Off Duty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offDutyEmployees.map((employee) => (
              <Card key={employee.id} className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={employee.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body font-heading font-semibold text-text-primary dark:text-white truncate">
                        {employee.name}
                      </h3>
                      <Badge variant="neutral">Off Duty</Badge>
                    </div>
                    {employee.phone && (
                      <p className="text-caption md:text-body text-text-secondary dark:text-gray-400 truncate">
                        {employee.phone}
                      </p>
                    )}
                    {employee.email && (
                      <p className="text-caption md:text-body text-text-secondary dark:text-gray-400 truncate">
                        {employee.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleWorking(employee.id)}
                    className="flex-1"
                    aria-label={`Mark ${employee.name} as working`}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Clock In
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(employee)}
                    className="!px-3"
                    aria-label={`Edit ${employee.name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteConfirm(employee.id)}
                    className="!px-3"
                    aria-label={`Delete ${employee.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          isOpen
          onClose={handleCloseModal}
          title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g., John Smith"
              error={errors.name}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setErrors(prev => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g., 0821234567"
              error={errors.phone}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder="e.g., john@example.com"
              error={errors.email}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingEmployee ? 'Save Changes' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          isOpen
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <p className="text-body text-text-primary dark:text-white mb-6">
            Are you sure you want to delete this employee? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} className="flex-1">
              Delete
            </Button>
          </div>
        </Modal>
      )}

      {undoItem && (
        <div className="fixed bottom-4 right-4 z-50">
          <UndoToast
            message={undoItem.message}
            onUndo={handleUndo}
            onExpire={clearUndo}
          />
        </div>
      )}
    </div>
  );
}