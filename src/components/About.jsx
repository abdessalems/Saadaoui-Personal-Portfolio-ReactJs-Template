import { Icon } from '@iconify/react';
import React from 'react';
import parser from 'html-react-parser';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';

export default function About({ data }) {
  const { imgSrc, miniTitle, title, description, funfacts, btnText, btnUrl } =
    data;
  return (
    <section className="about-section section" id="about">
      <div className="container">
        <div className="effect-1">
          <img
            src="/images/effect-1.svg"
            alt="Shape"
            width="339"
            height="339"
          />
        </div>
        <div className="effect-2">
          <img
            src="/images/effect-2.svg"
            alt="Shape"
            width="151"
            height="151"
          />
        </div>
        <div className="row align-items-center justify-content-center gy-5">
          <div
            className="col-lg-6 col-xl-5"
          >
            <div className="about-banner text-center">
              {/* The stylesheet gives this a width and lets the height follow
                  the picture, so without the intrinsic size here the row has
                  no height until the file lands and everything below it
                  jumps. */}
              <img
                src={imgSrc}
                alt="About Abdessalem Saadaoui"
                width="1122"
                height="1402"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="col-lg-6 col-xl-5 ps-lg-3 ps-xl-4">
            <div
              className="about-text"
            >
              <div className="section-heading">
                {miniTitle && (
                  <h6>
                    <span>{miniTitle}</span>
                  </h6>
                )}

                {title && <h2>{parser(title)}</h2>}
              </div>
              <p>{description}</p>
              <div className="review-box">
                {funfacts?.map((item, index) => {
                  const inner = (
                    <>
                      <h3>
                        {item.number}
                        <span>+</span>
                      </h3>
                      <label>{item.title}</label>
                      {item.link && (
                        <span className="r-box-cta">
                          {item.linkText || 'See more'} <Icon icon="bi:arrow-right" />
                        </span>
                      )}
                    </>
                  );
                  return item.link ? (
                    <Link to={item.link} className="r-box r-box-link" key={index}>
                      {inner}
                    </Link>
                  ) : (
                    <div className="r-box" key={index}>
                      {inner}
                    </div>
                  );
                })}
              </div>
              <div className="btn-bar">
                <ScrollLink
                  to={btnUrl}
                  spy={true}
                  smooth={true}
                  offset={-115}
                  duration={300}
                  className="px-btn"
                >
                  <span>{btnText}</span>{' '}
                  <i>
                    <Icon icon="bi:arrow-right" />
                  </i>
                </ScrollLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
