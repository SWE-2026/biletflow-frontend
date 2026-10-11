export type UserRole = 'customer' | 'organizer' | 'staff' | 'admin'

export type User = {
  id: string
  email: string
  displayName: string
  role: UserRole
  /** Set once the user has created an organizer profile. */
  organizerId: string | null
  emailVerified: boolean
  /** False for accounts created by email code until they set a password. */
  hasPassword: boolean
  createdAt: string
}

export type Session = {
  token: string
  user: User
}
