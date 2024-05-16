export interface JwtPayload {
  id_user: number;
  fullname: string;
  serviceCounter?: serviceCounter;
}
interface serviceCounter {
  id_branch: number;
  service: number[];
}
