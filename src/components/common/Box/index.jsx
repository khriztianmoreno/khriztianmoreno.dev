const Box = ({ children, as: Tag = 'div', className = '', ...props }) => (
  <Tag className={className} {...props}>
    {children}
  </Tag>
);

export default Box;
