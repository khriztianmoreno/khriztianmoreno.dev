import { useState } from 'react';

const Input = ({
  label,
  inputType = 'text',
  icon,
  iconPosition = 'left',
  className = '',
  onBlur = () => {},
  onFocus = () => {},
  onChange = () => {},
  ...props
}) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const htmlFor = label ? label.replace(/\s+/g, '_').toLowerCase() : undefined;
  const wrapperClass = ['reusecore__input', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      <div className="field-wrapper">
        <input
          {...props}
          id={htmlFor}
          name={htmlFor}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {icon && <span className="input-icon">{icon}</span>}
      </div>
    </div>
  );
};

export default Input;
