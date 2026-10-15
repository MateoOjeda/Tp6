export interface Activation {
  activationId: string;

  customerId: string;

  planId: string;

  status:
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'ACTIVE'
    | 'FAILED';

  simulateFailure:
    | 'none'
    | 'billing'
    | 'provisioning';

  createdAt: string;
}