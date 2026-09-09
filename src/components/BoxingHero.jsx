import React from 'react';
import { Icon } from '@iconify/react';
import SocialBtns from './SocialBtns';
import CountUp from './CountUp';

const FALLBACK_IMG = '/images/about-banner.webp';

export default function BoxingHero({ data }) {
  const { imgUrl, name, nickname, heading, description, record, titles, social } =
    data;
  return (
    <section className="boxing-hero section" id="boxing-home">
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-6">
            <div className="boxing-hero-text">
              <h6
                className="boxing-eyebrow"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <span>{heading}</span>
              </h6>
              <h1 data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                {name} {nickname && <span className="nickname">{nickname}</span>}
              </h1>
              <p data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                {description}
              </p>
              <ul
                className="boxing-titles"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="300"
              >
                {titles?.map((title, index) => (
                  <li key={index}>
                    <Icon icon="bi:trophy-fill" /> {title}
                  </li>
                ))}
              </ul>
              {social?.length > 0 && (
                <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                  <SocialBtns socialBtns={social} variant="boxing-social" />
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div
              className="boxing-hero-media"
              data-aos="fade-left"
              data-aos-duration="1200"
            >
              <img
                src={imgUrl}
                alt={name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />
            </div>
          </div>
        </div>

        {record && (
          <div className="boxing-record-bar" data-aos="fade-up" data-aos-duration="1000">
            <div className="record-item">
              <span className="num">
                <CountUp end={record.fights} />
              </span>
              <span className="label">Pro Fights</span>
            </div>
            <div className="record-item win">
              <span className="num">
                <CountUp end={record.wins} />
              </span>
              <span className="label">Wins</span>
            </div>
            <div className="record-item loss">
              <span className="num">
                <CountUp end={record.losses} />
              </span>
              <span className="label">Losses</span>
            </div>
            <div className="record-item draw">
              <span className="num">
                <CountUp end={record.draws} />
              </span>
              <span className="label">Draws</span>
            </div>
            <div className="record-item ko">
              <span className="num">
                <CountUp end={record.kos} />
              </span>
              <span className="label">KO / TKO</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
