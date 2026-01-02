interface InputProps {
  style: string;
  text: string;
  type?: string;
  pattern?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ style, text, type = "text", pattern, required, value, onChange }: InputProps) => {
  return (
    <input
      className={`${style} placeholder:text-gray-400`}
      placeholder={text}
      type={type}
      pattern={pattern}
      required={required}
      value={value}
      onChange={onChange}
    ></input>
  );
};

export default Input;
