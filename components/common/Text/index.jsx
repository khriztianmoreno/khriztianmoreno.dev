const Text = ({ content, as: Tag = 'p', className = '', ...props }) => (
  <Tag className={className} {...props}>
    {content}
  </Tag>
);

export default Text;
