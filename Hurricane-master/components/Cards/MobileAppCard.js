export default function MobileAppCard() {
  return (
      <div className="card">
        <div className="card__title transparent">
          <p className="card__title--left ">Get Musicoin mobile app</p>
        </div>
        <div className="card__content">
          <div className="app-download">
            <div className="app-download__container">
              <a href="https://apps.apple.com/us/app/musicoin/id1447230096?ls=1"><img src="/img/icons/apple-store.png" alt="Apple Store"/></a>
              <a href="https://play.google.com/store/apps/details?id=org.musicoin.musicoin"><img src="/img/icons/google-play-store.png" alt="Goole Play Store"/></a>
            </div>
          </div>
        </div>
      </div>
  );
}