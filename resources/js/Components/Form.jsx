import React from 'react';

// Text Input Component with optional icon
export const TextInput = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  icon = null,
  error = null,
  required = false
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-darkest">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full ${icon ? 'pl-10' : 'px-3'} pr-3 py-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary`}
          required={required}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

// Text Area Component with optional icon
export const TextArea = ({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder = '',
  icon = null,
  error = null,
  required = false
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-darkest">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            {icon}
          </div>
        )}
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={`block w-full ${icon ? 'pl-10' : 'px-3'} pr-3 py-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary`}
          required={required}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

// Password Input Component with optional toggle visibility feature
export const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  error = null,
  required = false
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-darkest">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full px-3 pr-10 py-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary"
          required={required}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral hover:text-neutral-dark"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

// Select Input Component with optional icon
export const SelectInput = ({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  icon = null,
  error = null,
  required = false
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-darkest">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`block w-full ${icon ? 'pl-10' : 'px-3'} pr-3 py-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary`}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

// File Input Component
export const FileInput = ({
  id,
  label,
  onChange,
  accept = '',
  error = null,
  required = false
}) => {
  const [fileName, setFileName] = React.useState('');
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
    onChange(e);
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-darkest">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="file"
          id={id}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          required={required}
        />
        <label
          htmlFor={id}
          className="flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {fileName || 'Pilih File'}
        </label>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

// Checkbox Input Component
export const CheckboxInput = ({
  id,
  label,
  checked,
  onChange,
  error = null,
  required = false
}) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-primary border-neutral-light rounded focus:ring-primary"
          required={required}
        />
      </div>
      <div className="ml-3 text-sm">
        {label && (
          <label htmlFor={id} className="font-medium text-neutral-darkest">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    </div>
  );
};

// Radio Input Component
export const RadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  error = null,
  required = false
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-neutral-darkest">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`radio-${option.value}`}
              name={label}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-primary border-neutral-light focus:ring-primary"
              required={required}
            />
            <label htmlFor={`radio-${option.value}`} className="ml-3 block text-sm font-medium text-neutral-dark">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export const FormSection = ({
  title,
  children
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">{title}</h3>
      {children}
    </div>
  );
};