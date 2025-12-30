interface ButtonProps {
  style: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button = ({ style, text, onClick, disabled, type = "button" }: ButtonProps) => {
  return (
    <button className={style} onClick={onClick} disabled={disabled} type={type}>
      {text}
    </button>
  );
};

export default Button;
