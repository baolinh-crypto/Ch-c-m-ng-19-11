import { FormEvent, useEffect, useRef, useState } from 'react';

type Letter = {
  sender: string;
  label: string;
  accent: string;
  lines: (name: string) => string[];
};

const letters: Letter[] = [
  {
    sender: 'Linh',
    label: 'Một lời chúc thật ấm',
    accent: 'coral',
    lines: (name) => [
      `Gửi ${name},`,
      'Nhân ngày Quốc tế Đàn ông 19/11, Linh chúc bạn luôn giữ được sự tự tin, tử tế và nguồn năng lượng tích cực của riêng mình.',
      'Mong những dự định bạn đang ấp ủ đều thuận lợi, mỗi ngày đến lớp đều có thêm một chuyện vui và mỗi lần cố gắng đều được đền đáp thật xứng đáng.',
      'Cảm ơn vì đã là một mảnh ghép rất riêng của lớp mình!',
    ],
  },
  {
    sender: 'Lương',
    label: 'Một chút vui vẻ gửi bạn',
    accent: 'blue',
    lines: (name) => [
      `Chào ${name},`,
      'Hôm nay là ngày dành riêng cho các bạn nam, nên Lương chúc bạn lúc nào cũng phong độ, nhiều niềm vui và ít bài tập về nhà hơn một chút.',
      'Chúc bạn đủ bản lĩnh để theo đuổi điều mình thích, đủ kiên nhẫn khi gặp khó khăn và luôn có những người bạn tốt đồng hành.',
      'Cứ thật rạng rỡ và tiếp tục mang thật nhiều tiếng cười đến lớp nhé!',
    ],
  },
  {
    sender: 'Thư',
    label: 'Một điều dịu dàng',
    accent: 'gold',
    lines: (name) => [
      `Thân gửi ${name},`,
      'Nhân ngày 19/11, Thư mong bạn luôn mạnh mẽ nhưng cũng đừng quên dành thời gian lắng nghe và chăm sóc chính mình.',
      'Chúc bạn có thật nhiều sức khỏe, những tình bạn chân thành, những ngày bình yên và một hành trình phía trước đầy điều đáng mong chờ.',
      'Hy vọng hôm nay sẽ là một kỷ niệm nhỏ nhưng thật đẹp của chúng mình.',
    ],
  },
];

function SoundIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
      <path d="M15 9.2a4 4 0 0 1 0 5.6M17.7 6.5a7.8 7.8 0 0 1 0 11" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
      <path d="m15 10 5 5m0-5-5 5" />
    </svg>
  );
}

function useGentleMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteRef = useRef(0);

  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    audioRef.current?.close();
    audioRef.current = null;
    setPlaying(false);
  };

  const start = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const context = new AudioCtx();
    audioRef.current = context;
    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 392];

    const playNote = () => {
      if (!audioRef.current) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = melody[nextNoteRef.current % melody.length];
      nextNoteRef.current += 1;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 1.4);
    };

    playNote();
    timerRef.current = window.setInterval(playNote, 850);
    setPlaying(true);
  };

  useEffect(() => () => stop(), []);
  return { playing, toggle: playing ? stop : start };
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export default function App() {
  const [inputName, setInputName] = useState('');
  const [name, setName] = useState('');
  const [activeLetter, setActiveLetter] = useState<number | null>(null);
  const { playing, toggle } = useGentleMusic();

  const submitName = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = inputName.trim().replace(/\s+/g, ' ');
    if (!cleaned) return;
    setName(cleaned);
    window.setTimeout(() => {
      document.querySelector('#letters')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveLetter(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <main className="site-shell">
      <div className="paper-noise" aria-hidden="true" />
      <div className="floating-shape shape-one" aria-hidden="true" />
      <div className="floating-shape shape-two" aria-hidden="true" />

      <button
        className={`music-button ${playing ? 'is-playing' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        type="button"
      >
        <SoundIcon playing={playing} />
        <span>{playing ? 'Đang phát' : 'Bật nhạc'}</span>
        {playing && <i className="sound-waves" aria-hidden="true"><b /><b /><b /></i>}
      </button>

      <section className="hero">
        <p className="eyebrow"><span /> Ngày Quốc tế Đàn ông · 19/11 <span /></p>
        <div className="hero-mark" aria-hidden="true">19</div>
        <h1>
          Ngày của những
          <em>chàng trai tuyệt vời</em>
        </h1>
        <p className="intro">
          Một món quà nhỏ, ba lá thư và thật nhiều lời chúc được dành riêng cho các bạn nam lớp mình.
        </p>

        <form className="name-form" onSubmit={submitName}>
          <label htmlFor="name">Bạn tên là gì?</label>
          <div className="input-wrap">
            <input
              id="name"
              value={inputName}
              onChange={(event) => setInputName(event.target.value)}
              placeholder="Nhập tên của bạn..."
              autoComplete="name"
              maxLength={40}
              required
            />
            <button type="submit">
              Nhận lời chúc
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
            </button>
          </div>
        </form>
        <p className="hint">Điền tên để mở những lá thư dành riêng cho bạn</p>
      </section>

      {name && (
        <section className="letters-section" id="letters">
          <div className="section-heading">
            <span className="small-kicker">Gửi riêng đến bạn</span>
            <h2>Ba lá thư dành cho <em>{name}</em></h2>
            <p>Chạm vào từng phong thư để đọc lời nhắn nhé.</p>
          </div>

          <div className="letters-grid">
            {letters.map((letter, index) => (
              <button
                className={`letter-card ${letter.accent}`}
                key={letter.sender}
                onClick={() => setActiveLetter(index)}
                type="button"
                style={{ '--delay': `${index * 100}ms` } as React.CSSProperties}
              >
                <span className="stamp">{String(index + 1).padStart(2, '0')}</span>
                <span className="envelope" aria-hidden="true">
                  <i className="envelope-back" />
                  <i className="letter-paper">
                    <b>Gửi {name}</b>
                    <span />
                    <span />
                    <span />
                  </i>
                  <i className="envelope-front" />
                  <i className="seal">{letter.sender.charAt(0)}</i>
                </span>
                <span className="letter-meta">
                  <small>{letter.label}</small>
                  <strong>Từ {letter.sender}</strong>
                </span>
                <span className="read-more">
                  Mở thư
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer>
        <span className="footer-line" />
        <p>Dành tặng những chàng trai tuyệt vời của lớp chúng mình</p>
        <span className="footer-line" />
      </footer>

      {activeLetter !== null && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setActiveLetter(null)}>
          <article
            className={`letter-modal ${letters[activeLetter].accent}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="close-button" onClick={() => setActiveLetter(null)} aria-label="Đóng lá thư" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <div className="modal-stamp">19<br /><span>11</span></div>
            <p className="modal-date">Ngày Quốc tế Đàn ông · 19/11</p>
            <div className="modal-copy">
              {letters[activeLetter].lines(name).map((line, index) =>
                index === 0 ? <h2 id="letter-title" key={line}>{line}</h2> : <p key={line}>{line}</p>
              )}
            </div>
            <div className="signature">
              <span>Thân mến,</span>
              <strong>{letters[activeLetter].sender}</strong>
            </div>
            <div className="modal-flower" aria-hidden="true"><i /><i /><i /><i /><b /></div>
          </article>
        </div>
      )}
    </main>
  );
}
