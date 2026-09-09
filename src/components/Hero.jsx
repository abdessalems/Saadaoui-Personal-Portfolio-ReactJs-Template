import { Icon } from '@iconify/react';
import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Link as ScrollLink } from 'react-scroll';
import SocialBtns from './SocialBtns';

/** The lines the animation types, without the pauses between them. */
function typedLines(sequence) {
  return sequence.filter((step) => typeof step === 'string');
}

/**
 * The roles the animation cycles through, as one sentence.
 *
 * Written out by hand this had already drifted — it still said "Java
 * Developer" after the animation had moved on to technical analysis and
 * full-stack work — so it is read from the same list the animation uses and
 * cannot say something different from what the page shows.
 */
function rolesSentence(sequence) {
  const roles = typedLines(sequence).map((line) =>
    line.replace(/^I'm an? /, ''),
  );
  if (!roles.length) return '';
  const last = roles.pop();
  return roles.length
    ? `I'm a ${roles.join(', ')} and ${last}`
    : `I'm a ${last}`;
}

export default function Hero({ data, socialData }) {
  const { imgUrl, name, heading, typingText, description, btnText, btnUrl } =
    data;
  return (
    <section className="home-section" id="home" data-scroll-index={0}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="hs-text-box">
              <h6 data-aos="fade-up" data-aos-duration="1200">
                <span>{name}</span>
              </h6>

              <h1
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="100"
              >
                {heading}
              </h1>
              <h2
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="200"
              >
                {/* A crawler renders the page and reads whatever is on screen at
                    that instant, and at that instant the animation is part way
                    through a word — which is how "I'm a Functi" ended up as the
                    headline in a Google result. The finished sentence is stated
                    here for anything reading the DOM, and the animation is marked
                    decorative so it is not announced twice to a screen reader. */}
                <span className="visually-hidden">
                  {rolesSentence(typingText)}
                </span>
                {/* Every line the animation will type is laid out here in the
                    same grid cell, all but one of them invisible, so the
                    heading is always as tall as the longest of them. Typed out
                    on its own the line grew and shrank between one, two and
                    three lines as the roles cycled, and everything below it
                    moved by as much as 145px every couple of seconds, for as
                    long as the page stayed open. */}
                <span className="hs-typing" aria-hidden="true">
                  {typedLines(typingText).map((line) => (
                    <span className="hs-typing-sizer" key={line}>
                      {line}
                    </span>
                  ))}
                  <span className="hs-typing-line">
                    <TypeAnimation
                      sequence={typingText}
                      speed={0}
                      repeat={Infinity}
                    />
                  </span>
                </span>
              </h2>
              <p
                className="text"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="300"
              >
                {description}
              </p>
              <div
                className="btn-bar d-flex align-items-sm-center flex-column flex-sm-row"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="400"
              >
                <ScrollLink
                  to={btnUrl}
                  spy={true}
                  smooth={true}
                  offset={-115}
                  duration={500}
                  className="px-btn"
                >
                  <span>{btnText}</span>{' '}
                  <i className="d-flex">
                    <Icon icon="bi:arrow-right" />
                  </i>
                </ScrollLink>
                <SocialBtns
                  socialBtns={socialData}
                  variant="ps-sm-4 pt-4 pt-sm-0 d-flex justify-content-center justify-content-sm-start"
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hs-banner">
              {/* The intrinsic size, so the browser can reserve the right
                  shape before the file arrives instead of collapsing the
                  column and pushing the page down when it loads. */}
              <img
                src={imgUrl}
                alt="Abdessalem Saadaoui"
                width="768"
                height="1152"
                fetchpriority="high"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
