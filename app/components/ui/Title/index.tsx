import React from 'react';
import styles from './styles.module.scss';

interface TitleProps {
  className?: string;
}

export function Title({ className = '' }: TitleProps) {
  return <span className={`${styles.title} ${className}`}>Bol</span>;
}
