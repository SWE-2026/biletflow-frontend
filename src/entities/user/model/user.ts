export type User = {
  id: string
  email: string
}

export type Session = {
  token: string
  user: User
}
