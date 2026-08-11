export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES';
  createdAt?: Date;
  updatedAt?: Date;
}
