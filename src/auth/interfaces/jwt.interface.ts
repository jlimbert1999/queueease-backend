export interface JwtPayload {
  id_user: number;
  fullname: string;
  counter?: counter;
}
interface counter {
  id_branch: number;
  services: number[];
}
