import React, {useState} from 'react';
import './styles.css';

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export default function YouTube({id, title}) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('YouTube: the "title" prop is required and must not be empty.');
  }
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new Error(`YouTube: the "id" prop must be an 11 character video id, got "${id}".`);
  }

  const [playing, setPlaying] = useState(false);
  const watchUrl = 'https://www.youtube.com/watch?v=' + id;

  if (playing) {
    return (
      <figure className="youtube-facade youtube-facade--playing">
        <iframe
          src={'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0'}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      </figure>
    );
  }

  return (
    <figure className="youtube-facade">
      <button
        type="button"
        className="youtube-facade__button"
        aria-label={'Play video: ' + title}
        onClick={() => setPlaying(true)}>
        <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="youtube-facade__title">{title}</span>
      </button>
      <p className="youtube-facade__consent">
        Plays from YouTube (youtube-nocookie.com). Loading the video sends data to Google.
      </p>
      <a href={watchUrl} rel="noopener noreferrer">
        Watch on YouTube
      </a>
      <p className="youtube-facade__print">{title + ': ' + watchUrl}</p>
    </figure>
  );
}
