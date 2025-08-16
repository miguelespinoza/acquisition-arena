export interface Parcel {
  id: number
  parcelNumber: string
  city: string
  state: string
  propertyFeatures: Record<string, unknown>
  createdAt: string
  updatedAt: string
}