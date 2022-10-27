export interface ISendMessage {
    message: string;
    username: string;
    room: string;
    createdAt: Date;
}

export interface IUserInformation {
    username: string;
    user_id: string;
    socket_id: string;
    room: string;
}