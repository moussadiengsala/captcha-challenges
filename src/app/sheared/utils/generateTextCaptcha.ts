export function generateTextCaptcha()  {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    const captChatCode = Array.from(
      { length }, 
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join('');
    return captChatCode;
};