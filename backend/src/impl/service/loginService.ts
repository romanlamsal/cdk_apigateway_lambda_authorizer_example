import {UserRepository} from "../repository/userRepository";

export async function checkCredentials(
    username: string,
    password: string,
    userRepository: typeof UserRepository
): Promise<boolean> {
    return userRepository.credentialsAreValid(username, password)
}

export const LoginService = {
    checkCredentials
}
