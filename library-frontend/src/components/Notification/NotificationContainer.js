import { useEffect, useRef, useState } from 'react';
import Notification from './Notification';

function NotificationContainer({ text, isError }) {
  const [notification, setNotification] = useState('');

  let timeoutId = useRef();

  useEffect(() => {
    clearTimeout(timeoutId);
    timeoutId.current = setTimeout(() => {
      setNotification(null);
    }, 5000);

    setNotification(text);

    return () => {
      clearTimeout(timeoutId.current);
    };
  }, [text]);

  return <Notification text={notification} isError={isError} />;
}

export default NotificationContainer;
