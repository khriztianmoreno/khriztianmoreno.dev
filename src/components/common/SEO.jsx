import Head from 'next/head';

const SEO = (props) => {
  const {
    title = 'A Very khriztianmoreno Website — Javascript Developer 👨🏼‍💻🇨🇴💻',
    description = 'khriztianmoreno is a web developer, educator, and community builder. Helps others learn by doing through articles, videos, and courses about JavaScript, React, and the static web.',
    url = 'https://khriztianmoreno.dev/',
    image = 'https://res.cloudinary.com/khriztianmoreno/image/upload/v1591324325/KM-brand/card/kristian%20moreno-6_card-front%402x-assets/card-front.png',
    post = false,
  } = props;

  return (
    <Head>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={description} />
      <meta name="image" content={image} />

      <meta property="og:type" content={post ? 'article' : 'website'} />
      <meta property="og:url" content={url} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:dnt" content="on" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@khriztianmoreno" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link
        href="https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,600,700,800|Roboto:300,400,400i,500,700,900"
        rel="stylesheet"
      />
    </Head>
  );
};

export default SEO;
