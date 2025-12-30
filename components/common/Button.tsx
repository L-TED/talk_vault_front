interface ButtonProps {
  style: string;
  text: string;
}

const Button = ({ style, text }: ButtonProps) => {
  return <button className={style}>{text}</button>;
};

export default Button;
