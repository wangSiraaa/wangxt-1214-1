import api from './index'

export interface Battery {
  _id?: string
  batteryCode: string
  vin?: string
  vehiclePlate?: string
  vehicleModel?: string
  batteryModel?: string
  nominalCapacity?: number
  nominalVoltage?: number
  status: string
  receiver?: string
  receiveDate?: Date
  packageCount?: number
  weight?: number
  remark?: string
  capacity?: number
  internalResistance?: number
  safetyLevel?: string
  inspector?: string
  inspectionDate?: Date
  cascadePurpose?: string
  customerName?: string
  saleDate?: Date
  salesPerson?: string
  isInspectionLocked?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface RegisterBatteryDto {
  batteryCode: string
  vin?: string
  saveMode?: 'register' | 'pending_vin'
  vehiclePlate?: string
  vehicleModel?: string
  batteryModel?: string
  nominalCapacity?: number
  nominalVoltage?: number
  receiver?: string
  receiveDate?: Date
  packageCount?: number
  weight?: number
  remark?: string
}

export interface SupplementVinDto {
  vin: string
}

export function getBatteryList(params: {
  page?: number
  pageSize?: number
  batteryCode?: string
  vin?: string
  status?: string
  safetyLevel?: string
  receiver?: string
  vehiclePlate?: string
}) {
  return api.get<{ code: number; message: string; data: { list: Battery[]; total: number } }>('/battery', { params })
}

export function getBatteryById(id: string) {
  return api.get<{ code: number; message: string; data: Battery }>(`/battery/${id}`)
}

export function getBatteryByCode(code: string) {
  return api.get<{ code: number; message: string; data: Battery }>(`/battery/code/${code}`)
}

export function registerBattery(dto: RegisterBatteryDto) {
  return api.post<{ code: number; message: string; data: Battery }>('/battery/register', dto)
}

export function supplementVin(id: string, dto: SupplementVinDto) {
  return api.post<{ code: number; message: string; data: Battery }>(`/battery/${id}/supplement-vin`, dto)
}

export function updateBattery(id: string, dto: Partial<Battery>) {
  return api.put<{ code: number; message: string; data: Battery }>(`/battery/${id}`, dto)
}

export function getBatteryStatistics() {
  return api.get<{ code: number; message: string; data: Record<string, number> }>('/battery/statistics')
}
