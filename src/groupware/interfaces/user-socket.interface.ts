import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

export interface UserSocket extends JwtPayload {
  socketIds: string[];
}
