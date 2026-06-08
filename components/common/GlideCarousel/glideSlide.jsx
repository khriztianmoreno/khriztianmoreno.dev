const GlideSlide = ({ children, perView = 4 }) => (
  <div
    className="glide__slide"
    style={{ '--per-view': perView, minWidth: 0 }}
  >
    {children}
  </div>
);

export default GlideSlide;
