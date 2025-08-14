export interface Parcel {
  id: number
  parcelNumber: string
  location: string
  propertyFeatures: Record<string, unknown>
  createdAt: string
  updatedAt: string
}