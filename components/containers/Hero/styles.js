import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(-1turn);
  }

  to {
    transform: rotate(0);
  }
`;

const HeroWrapper = styled.section`
  align-items: center;
  background-color: #010040;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding-top: 80px;
  position: relative;

  .hero {
    margin: 0 auto;
    max-height: 65vw;
    max-width: 700px;
    overflow: hidden;
    position: relative;
    text-align: center;
    text-transform: uppercase;
    width: 90vw;
    z-index: 1;
  }

  .boops {
    mix-blend-mode: overlay;
    z-index: 10;
  }

  .cycle {
    display: block;
    font-size: 0.75rem;
    font-variant: small-caps;
    font-weight: 200;
    letter-spacing: 0.2em;
    margin: 0 auto;
    position: relative;
    text-align: center;
    text-decoration: none;
    width: 30px;
    z-index: 20;
  }

  .cycle.active {
    animation-duration: 500ms;
    animation-name: ${spin};
    animation-iteration-count: 1;
  }

  .hero-tagline {
    color: #00f6bb;
    display: block;
    font-family: 'Raleway', sans-serif;
    font-size: var(--size, 7.42vw);
    margin-top: -1rem;
  }

  @media (min-width: 775px) {
    .hero-tagline {
      font-size: var(--size-lg, 57.5px);
      margin-top: -3rem;
    }
  }

  .love {
    background: url('https://res.cloudinary.com/khriztianmoreno/image/upload/v1623081614/km_site/love.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    color: transparent;
    display: inline-block;
    height: 1.2em;
    margin: -0.1em -3px;
    position: relative;
    top: var(--top, -0.05em);
    transform: scale(var(--scale, 1.1)) rotate(var(--rotation, -11deg))
      translateY(0.1em);
    transform-origin: center;
    width: 1.6em;
  }

  .think {
    background: url('https://cdn0.iconfinder.com/data/icons/Flag-Social-Media-Icon-Set/256/_Youtube.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    color: transparent;
    display: inline-block;
    height: 1.2em;
    margin: -0.1em -3px;
    position: relative;
    top: var(--top, -0.05em);
    transform: scale(var(--scale, 1.1)) rotate(var(--rotation, -11deg))
      translateY(0.1em);
    transform-origin: center;
    width: 1.6em;
  }
  .speaker {
    background: url('https://cdn2.iconfinder.com/data/icons/activity-5/50/1F3A4-microphone-512.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    color: transparent;
    display: inline-block;
    height: 1.2em;
    margin: -0.1em -3px;
    position: relative;
    top: var(--top, -0.05em);
    transform: scale(var(--scale, 1.1)) rotate(var(--rotation, -11deg))
      translateY(0.1em);
    transform-origin: center;
    width: 1.6em;
  }

  .thumb-up {
    background: url('https://image.flaticon.com/icons/png/512/1533/1533908.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    color: transparent;
    display: inline-block;
    height: 1.2em;
    margin: -0.1em -3px;
    position: relative;
    top: var(--top, -0.05em);
    transform: scale(var(--scale, 1.1)) rotate(var(--rotation, -11deg))
      translateY(0.1em);
    transform-origin: center;
    width: 1.6em;
  }

  .push-me {
    color: #00f6bb;
  }

  .cycle img {
    width: 100%;
  }

  @media (min-width: 775px) {
    .firstLine {
      font-size: 197px;
    }

    .box {
      font-size: 102.5px;
    }

    .tagline {
      font-size: 12px;
    }
  }
`;

export default HeroWrapper;
