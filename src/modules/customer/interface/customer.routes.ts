import express from 'express';
import { CustomerController } from './customer.controller';
import { CustomerService } from '../application/customer.service';
import { CustomerRepository } from '../domain/customer.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';

// Create router
const router = express.Router();

// Initialize repository, service, and controller
const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);
const customerController = new CustomerController(customerService);

// Apply authentication middleware to all routes
router.use(authenticate);

// Simple test route
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Customer routes are working!' });
});

// Get all customers
router.get('/', (req, res, next) => customerController.getCustomers(req, res, next));

// Create new customer
router.post('/', (req, res, next) => customerController.createCustomer(req, res, next));

// Get customer by ID
router.get('/:id', (req, res, next) => customerController.getCustomerById(req, res, next));

// Update customer
router.put('/:id', (req, res, next) => customerController.updateCustomer(req, res, next));

// Delete customer
router.delete('/:id', (req, res, next) => customerController.deleteCustomer(req, res, next));

// Export both ways to ensure compatibility
module.exports = router;
export default router; 