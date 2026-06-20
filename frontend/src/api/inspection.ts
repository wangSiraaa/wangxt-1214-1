import api from './index'

export interface Inspection {
  _id?: string
  batteryId: string
  batteryCode: string
  inspector: string
  inspectionDate: Date
  capacity: number
  capacityRatio?: number
  internalResistance: number
  internalResistanceRatio?: number
  safetyLevel: string
  testItems?: string[]
  appearanceCheck?: string
  voltage?: number
  temperature?: number
  insulationResistance?: number
  result: string
  conclusion?: string
  suggestRoute?: string
  isLocked?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateInspectionDto {
  batteryId: string
  batteryCode: string
  inspector: string
  inspectionDate?: Date
  capacity: number
  capacityRatio?: number
  internalResistance: number
  internalResistanceRatio?: number
  safetyLevel: string
  testItems?: string[]
  appearanceCheck?: string
  voltage?: number
  temperature?: number
  insulationResistance?: number
  conclusion?: string
  suggestRoute?: string
}

export function getInspectionList(params: {
  page?: number
  pageSize?: number
  batteryCode?: string
  inspector?: string
  safetyLevel?: string
  result?: string
  startDate?: string
  endDate?: string
}) {
  return api.get<{ code: number; message: string; data: { list: Inspection[]; total: number } }>('/inspection', { params })
}

export function getInspectionById(id: string) {
  return api.get<{ code: number; message: string; data: Inspection }>(`/inspection/${id}`)
}

export function getInspectionsByBattery(batteryId: string) {
  return api.get<{ code: number; message: string; data: Inspection[] }>(`/inspection/battery/${batteryId}`)
}

export function createInspection(dto: CreateInspectionDto) {
  return api.post<{ code: number; message: string; data: Inspection }>('/inspection', dto)
}

export function updateInspection(id: string, dto: Partial<Inspection>) {
  return api.put<{ code: number; message: string; data: Inspection }>(`/inspection/${id}`, dto)
}

export function lockInspection(id: string) {
  return api.put<{ code: number; message: string; data: Inspection }>(`/inspection/${id}/lock`)
}
