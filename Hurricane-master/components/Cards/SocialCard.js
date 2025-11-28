export default function SocialCard(){
  return(
      <div className="card">
        <div className="card__title">
          <p>Social</p>
        </div>
        <div className="card__content">
          <div className="social">
            <ul className="social__list">
              <a href="https://twitter.com/musicoins">
                <li className="social__link"><img src="/img/icons/twitter.png" className="social__icon" alt=""/> Twitter</li>
              </a>
              <a href="https://reddit.com/r/musicoin">
                <li className="social__link"><img src="/img/icons/reddit.png" className="social__icon" alt=""/> Reddit</li>
              </a>
              <a href="https://medium.com/@musicoin">
                <li className="social__link"><img src="/img/icons/medium.png" className="social__icon" alt=""/>Medium</li>
              </a>
              <a href="https://bitcointalk.org/index.php?topic=1776113.0">
                <li className="social__link"><img src="/img/icons/bitcoin-talk.png" className="social__icon" alt=""/>Bitcoin Talk</li>
              </a>
              <a href="https://github.com/musicoin">
                <li className="social__link"><img src="/img/icons/github.png" className="social__icon" alt=""/>Github</li>
              </a>
              <a href="https://www.facebook.com/lovemusicoin/">
                <li className="social__link"><img src="/img/icons/facebook.png" className="social__icon" alt=""/> Facebook</li>
              </a>
            </ul>
          </div>
        </div>
      </div>
  )
}