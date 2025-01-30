export interface Store {
    user: string;
    auth: boolean;
    initialize: (user: string) => void;
    logout: () => void;
}