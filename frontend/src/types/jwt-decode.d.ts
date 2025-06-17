declare module 'jwt-decode' {
  interface JwtPayload {
    exp: number;
    iat: number;
    sub: string;
    username: string;
    [key: string]: any;
  }

  function jwt_decode<T = JwtPayload>(token: string, options?: { header?: boolean }): T;
  
  export default jwt_decode;
}
