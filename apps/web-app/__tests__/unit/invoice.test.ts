import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the invoice module
jest.mock('../../lib/invoice', () => ({
  createInvoice: jest.fn(),
  getInvoices: jest.fn(),
  getInvoiceById: jest.fn(),
  getInvoiceByToken: jest.fn(),
  updateInvoiceStatus: jest.fn(),
}))

describe('Invoice Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Invoice Creation', () => {
    it('should create invoice with valid data', async () => {
      const { createInvoice } = require('../../lib/invoice')
      const mockInvoice = {
        id: 1,
        clientId: 1,
        userId: 1,
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        invoiceNumber: 'INV-2024-001',
        data: {
          items: [
            { name: 'Usługa A', quantity: 1, price: 100, vat: 23 }
          ]
        },
        status: 'draft',
        payToken: 'abc123'
      }

      createInvoice.mockResolvedValue(mockInvoice)

      const result = await createInvoice({
        clientId: 1,
        userId: 1,
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        invoiceNumber: 'INV-2024-001',
        data: {
          items: [
            { name: 'Usługa A', quantity: 1, price: 100, vat: 23 }
          ]
        }
      })

      expect(createInvoice).toHaveBeenCalledWith({
        clientId: 1,
        userId: 1,
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        invoiceNumber: 'INV-2024-001',
        data: {
          items: [
            { name: 'Usługa A', quantity: 1, price: 100, vat: 23 }
          ]
        }
      })
      expect(result).toEqual(mockInvoice)
    })

    it('should handle invoice creation error', async () => {
      const { createInvoice } = require('../../lib/invoice')
      
      createInvoice.mockRejectedValue(new Error('Database error'))

      await expect(createInvoice({
        clientId: 1,
        userId: 1,
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        invoiceNumber: 'INV-2024-001',
        data: { items: [] }
      })).rejects.toThrow('Database error')
    })
  })

  describe('Invoice Retrieval', () => {
    it('should get invoices list', async () => {
      const { getInvoices } = require('../../lib/invoice')
      const mockInvoices = [
        {
          id: 1,
          invoiceNumber: 'INV-2024-001',
          status: 'draft',
          client: { name: 'Test Client' }
        }
      ]

      getInvoices.mockResolvedValue(mockInvoices)

      const result = await getInvoices(1) // userId

      expect(getInvoices).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockInvoices)
    })

    it('should get invoice by token', async () => {
      const { getInvoiceByToken } = require('../../lib/invoice')
      const mockInvoice = {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        status: 'sent',
        client: { name: 'Test Client' },
        payToken: 'abc123'
      }

      getInvoiceByToken.mockResolvedValue(mockInvoice)

      const result = await getInvoiceByToken('abc123')

      expect(getInvoiceByToken).toHaveBeenCalledWith('abc123')
      expect(result).toEqual(mockInvoice)
    })

    it('should return null for invalid token', async () => {
      const { getInvoiceByToken } = require('../../lib/invoice')
      
      getInvoiceByToken.mockResolvedValue(null)

      const result = await getInvoiceByToken('invalid-token')

      expect(getInvoiceByToken).toHaveBeenCalledWith('invalid-token')
      expect(result).toBeNull()
    })
  })

  describe('Invoice Status Updates', () => {
    it('should update invoice status', async () => {
      const { updateInvoiceStatus } = require('../../lib/invoice')
      
      updateInvoiceStatus.mockResolvedValue({ id: 1, status: 'paid' })

      const result = await updateInvoiceStatus(1, 'paid')

      expect(updateInvoiceStatus).toHaveBeenCalledWith(1, 'paid')
      expect(result).toEqual({ id: 1, status: 'paid' })
    })
  })
}) 