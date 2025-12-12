import styles from './Table.module.css';

export default function Table({ children, ...props }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, ...props }) {
  return <thead {...props}>{children}</thead>;
}

export function TableBody({ children, ...props }) {
  return <tbody {...props}>{children}</tbody>;
}

export function TableRow({ children, ...props }) {
  return <tr className={styles.row} {...props}>{children}</tr>;
}

export function TableHeaderCell({ children, ...props }) {
  return <th className={styles.headerCell} {...props}>{children}</th>;
}

export function TableCell({ children, ...props }) {
  return <td className={styles.cell} {...props}>{children}</td>;
}

