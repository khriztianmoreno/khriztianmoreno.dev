const Heading = ({ content, as: Tag = 'h2', className = '', ...props }) => (
  <Tag className={className} {...props}>
    {content}
  </Tag>
);

export default Heading;
