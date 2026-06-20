import api from './index'

export interface FlowEvent {
  _id?: string
  batteryId: string
  batteryCode: string
  eventType: string
  fromStatus?: string
  toStatus?: string
  operator?: string
  operationTime?: Date
  remark?: string
  beforeData?: Record<string, any>
  afterData?: Record<string, any>
  syncedToAudit?: boolean
  auditSyncTime?: Date
  createdAt?: Date
}

export function getFlowEventList(params: {
  page?: number
  pageSize?: number
  batteryCode?: string
  eventType?: string
  operator?: string
  startDate?: string
  endDate?: string
}) {
  return api.get<{ code: number; message: string; data: { list: FlowEvent[]; total: number } }>('/flow', { params })
}

export function getBatteryFlowEvents(batteryId: string) {
  return api.get<{ code: number; message: string; data: FlowEvent[] }>(`/flow/battery/${batteryId}`)
}

export function getBatteryAuditList(params: {
  page?: number
  pageSize?: number
  batteryCode?: string
  status?: string
  safetyLevel?: string
  vin?: string
}) {
  return api.get<{ code: number; message: string; data: { list: any[]; total: number } }>('/audit/battery', { params })
}

export function getFlowEventAuditList(params: {
  page?: number
  pageSize?: number
  batteryCode?: string
  eventType?: string
  operator?: string
}) {
  return api.get<{ code: number; message: string; data: { list: any[]; total: number } }>('/audit/flow-events', { params })
}
