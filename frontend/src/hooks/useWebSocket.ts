import {  useState } from 'react';
export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  
    const connect = () => {
    if (socket) {
      socket.close();
    }
    setSocket(new WebSocket(url));
    console.log('socket',socket);
    socket!.onopen = async () => {
        if (socket!.readyState !== socket!.OPEN) {
            try {
              await waitForOpenConnection(socket!);
              console.log("connected foirst");
              setIsOpen(true);
            } catch (err) {
              console.error(err);
            }
          }else{
            setIsOpen(true);
        }
      
    };
    socket!.onclose = () => {
      setIsOpen(false);
    };
  };
  
  connect();

  return { socket, isOpen };
};
export const waitForOpenConnection = (socket: WebSocket) => {
    return new Promise((resolve, reject) => {
      const maxNumberOfAttempts = 10;
      const intervalTime = 200; //ms

      let currentAttempt = 0;
      const interval = setInterval(() => {
        if (currentAttempt > maxNumberOfAttempts - 1) {
          clearInterval(interval);
          reject(new Error("Maximum number of attempts exceeded"));
        } else if (socket.readyState === socket.OPEN) {
          clearInterval(interval);
          resolve(true);
        }
        currentAttempt++;
      }, intervalTime);
    });
  };