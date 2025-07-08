import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Modal,
} from "react-bootstrap";
import { adminAPI } from "../../utils/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate, getEmployeeStatusColor } from "../../utils/helpers";
import { toast } from "react-toastify";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    position: "",
    phone: "",
    joinDate: "",
    leaveBalance: 20,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllEmployees();

      const employeeData = response.data?.employees || response.data || [];
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await adminAPI.deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!formData.position.trim()) {
      errors.position = "Position is required";
    }

    if (!formData.joinDate.trim()) {
      errors.joinDate = "Join date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      await adminAPI.createEmployee(formData);
      toast.success("Employee added successfully!");
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        employeeId: "",
        department: "",
        position: "",
        phone: "",
        joinDate: "",
        leaveBalance: 20,
      });
      setFormErrors({});
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error(error.response?.data?.error || "Failed to add employee");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      employee.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Employee Management</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Add Employee
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0">All Employees ({employees.length})</h5>
            </Col>
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredEmployees.length > 0 ? (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="fw-bold">{employee.employeeId}</td>
                    <td>
                      {employee.name}
                    </td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>{formatDate(employee.joinDate)}</td>
                    <td>
                      <Badge bg={getEmployeeStatusColor(employee.status)}>
                        {employee.status || "Active"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-users fs-1 text-muted mb-3"></i>
              <p className="text-muted">
                {search
                  ? "No employees found matching your search."
                  : "No employees found."}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="fw-bold text-primary">{employees.length}</h4>
              <p className="text-muted mb-0">Total Employees</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="fw-bold text-success">
                {
                  employees.filter((e) => e.status === "active" || !e.status)
                    .length
                }
              </h4>
              <p className="text-muted mb-0">Active</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="fw-bold text-warning">
                {employees.filter((e) => e.status === "inactive").length}
              </h4>
              <p className="text-muted mb-0">Inactive</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="fw-bold text-info">
                {[...new Set(employees.map((e) => e.department))].length}
              </h4>
              <p className="text-muted mb-0">Departments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Employee Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddEmployee}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Full Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.name}
                    placeholder="Enter full name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Employee ID <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.employeeId}
                    placeholder="Enter employee ID"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.employeeId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.email}
                    placeholder="Enter email address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.password}
                    placeholder="Enter password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Department <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.department}
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.department}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Position <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.position}
                    placeholder="Enter position"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.position}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Join Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.joinDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.joinDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Leave Balance (Days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="leaveBalance"
                    value={formData.leaveBalance}
                    onChange={handleInputChange}
                    min="0"
                    max="365"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
            disabled={submitLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddEmployee}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Adding...
              </>
            ) : (
              "Add Employee"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeManagement;
