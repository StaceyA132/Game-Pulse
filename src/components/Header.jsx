import './Header.css'

export function Header() {
  return (
    <header className="header container">
      <h1 className="header__logo">
        <span>
          Game<span className="header__accent">Pulse</span>
        </span>
        <svg className="header__pulse" viewBox="0 0 40 20" aria-hidden="true">
          <path d="M1 11h8l4-9 6 16 4-8h16" />
        </svg>
      </h1>
      <p className="header__tagline">Live game moments → push alerts &amp; social posts</p>
    </header>
  )
}
