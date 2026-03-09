export interface LoginData {

}

export interface User {

}

export interface LoginResponse {

}

export const login = async (_data: LoginData): Promise<LoginResponse> => {
  return Promise.reject(new Error('Ошибка'));
};