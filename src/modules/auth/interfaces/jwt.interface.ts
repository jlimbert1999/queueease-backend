export interface JwtPayload {
  id_user: string;
  fullname: string;
  counter?: counter;
}
interface counter {
  id_branch: string;
  services: string[];
}
