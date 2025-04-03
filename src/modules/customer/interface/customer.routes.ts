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

// Public routes
// Create new customer
router.post('/', (req, res, next) => customerController.createCustomer(req, res, next));

// Get or create customer
router.post('/get-or-create', (req, res, next) => customerController.getOrCreateCustomer(req, res, next));

// Protected routes below
// Get all customers
router.get('/', authenticate, (req, res, next) => customerController.getCustomers(req, res, next));
router.get('/:id', (req, res, next) => customerController.getCustomerById(req, res, next));
router.put('/:id', (req, res, next) => customerController.updateCustomer(req, res, next));
router.delete('/:id', (req, res, next) => customerController.deleteCustomer(req, res, next));

// Export the router
export default router; 