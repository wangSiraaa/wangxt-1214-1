import api from './index'

export interface SaleOrder {
  _id?: string
  orderNo: string
  customerName: string
  customerContact?: string
  customerPhone?: string
  customerAddress?: string
  cascadePurpose: string
  batteryIds: string[]
  batteryList: {
    batteryCode: string
    capacity?: number
    safetyLevel?: string
  }[]
  totalQuantity?: number
  totalAmount?: number
  salesPerson: string
  saleDate?: Date
  status: string
  remark?: string
  shippingDate?: Date
  shippingAddress?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateSaleOrderDto {
  customerName: string
  customerContact?: string
  customerPhone?: string
  customerAddress?: string
  cascadePurpose: string
  batteryIds: string[]
  totalAmount?: number
  salesPerson: string
  saleDate?: Date
  remark?: string
  shippingAddress?: string
}

export function getSaleOrderList(params: {
  page?: number
  pageSize?: number
  orderNo?: string
  customerName?: string
  status?: string
  cascadePurpose?: string
  salesPerson?: string
}) {
  return api.get<{ code: number; message: string; data: { list: SaleOrder[]; total: number } }>('/sales', { params })
}

export function getSaleOrderById(id: string) {
  return api.get<{ code: number; message: string; data: SaleOrder }>(`/sales/${id}`)
}

export function createSaleOrder(dto: CreateSaleOrderDto) {
  return api.post<{ code: number; message: string; data: SaleOrder }>('/sales', dto)
}

export function updateSaleOrder(id: string, dto: Partial<SaleOrder>) {
  return api.put<{ code: number; message: string; data: SaleOrder }>(`/sales/${id}`, dto)
}

export function confirmSaleOrder(id: string) {
  return api.put<{ code: number; message: string; data: SaleOrder }>(`/sales/${id}/confirm`)
}

export function shipSaleOrder(id: string) {
  return api.put<{ code: number; message: string; data: SaleOrder }>(`/sales/${id}/ship`)
}

export function completeSaleOrder(id: string) {
  return api.put<{ code: number; message: string; data: SaleOrder }>(`/sales/${id}/complete`)
}

export function cancelSaleOrder(id: string) {
  return api.put<{ code: number; message: string; data: SaleOrder }>(`/sales/${id}/cancel`)
}

export function getCascadePurposes() {
  return api.get<{ code: number; message: string; data: { value: string; label: string; description: string }[] }>('/sales/purposes')
}

export function getAvailableBatteries() {
  return api.get<{ code: number; message: string; data: any[] }>('/sales/available-batteries')
}
