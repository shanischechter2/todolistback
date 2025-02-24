import { User } from './user'

export const UserTests = {
    sign_in_test(user: Omit<User, "user_id">):boolean {
        if (!user.username || !user.email || !user.password) {
           
            return false;
        }
       return true;
    },
    log_in_test(user: Omit<User, "user_id"|"username">):boolean {
        if ( !user.email || !user.password) {
           
            return false;
        }
       return true;
    }
};
