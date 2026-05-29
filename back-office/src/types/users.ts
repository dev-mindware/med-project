import { BaseEntity, UserRole } from "./common";

export type UserData = {
  email: string;
  password?: string;
  name: string;
  role?: UserRole;
  isActive?: boolean;
  supervisorId?: string | null;
};

export type UserResponse = Omit<UserData, "password"> &
  BaseEntity & {
    managedOperators?: UserResponse[];
  };

export type AssignSupervisorOperatorsData = {
  operatorIds: string[];
};
