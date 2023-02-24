import { useEffect, useRef } from 'react';
import Notification from './Notification';

function NotificationContainer({ notification, setNotification }) {
  let timeoutId = useRef();

  useEffect(() => {
    clearTimeout(timeoutId);

    timeoutId.current = setTimeout(() => {
      setNotification({ text: '' });
    }, 5000);

    return () => {
      clearTimeout(timeoutId.current);
    };
  }, [notification.text, setNotification]);

  return (
    <Notification text={notification.text} isError={notification.isError} />
  );
}

export default NotificationContainer;
