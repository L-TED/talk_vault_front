interface InputProps {
  style: string;
  text: string;
  type?: string;
  pattern?: string;
  required?: boolean;
}

const Input = ({ style, text, type = "text", pattern, required }: InputProps) => {
  return (
    <input
      className={style}
      placeholder={text}
      type={type}
      pattern={pattern}
      required={required}
    ></input>
  );
};

export default Input;
