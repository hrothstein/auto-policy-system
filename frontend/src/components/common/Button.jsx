import styles from './Button.module.css';

export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, ...props }) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

