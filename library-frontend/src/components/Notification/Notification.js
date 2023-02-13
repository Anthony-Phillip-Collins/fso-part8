import PropTypes from 'prop-types';
import cn from 'classnames';
import styles from './Notification.module.css';

function Notification({ text, isError }) {
  return (
    text && (
      <div className={cn(styles.notification, isError && styles.error)}>
        {text}
      </div>
    )
  );
}

Notification.defaultProps = {
  text: '',
  isError: false,
};

Notification.propTypes = {
  text: PropTypes.string,
  isError: PropTypes.bool,
};

export default Notification;
