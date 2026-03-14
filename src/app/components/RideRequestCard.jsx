import "./RideRequestCard.css";

export default function RideRequestCard() {
  return (
    <div className="ride-request-page">
      <div className="ride-card">
        <div className="ride-card__top">
          <div className="ride-card__profile">
            <div className="ride-card__avatar" aria-hidden="true" />
            <div className="ride-card__info">
              <div className="ride-card__name">Oluwatobi</div>
              <div className="ride-card__rating">
                <span className="ride-card__star" aria-hidden="true">
                  ★
                </span>
                <span>4.8 (345)</span>
              </div>
            </div>
          </div>

          <div className="ride-card__actions">
            <button
              type="button"
              className="ride-card__icon-btn"
              aria-label="Call"
              onClick={() => console.log("Call rider")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6.6 3.2c.4-.4 1-.4 1.4 0l2.7 2.7c.4.4.4 1 0 1.4l-1.3 1.3c1.2 2.3 3.1 4.2 5.4 5.4l1.3-1.3c.4-.4 1-.4 1.4 0l2.7 2.7c.4.4.4 1 0 1.4l-1.6 1.6c-.7.7-1.8 1-2.8.8-6.3-1.4-11.3-6.4-12.7-12.7-.2-1 .1-2.1.8-2.8l1.6-1.6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="ride-card__icon-btn"
              aria-label="Chat"
              onClick={() => console.log("Chat with rider")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="ride-card__details">
          <div className="ride-card__row">
            <span className="ride-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <span>Gbagi market, Iwo road</span>
          </div>
          <div className="ride-card__row">
            <span className="ride-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 21s6-6.2 6-10.5A6 6 0 1 0 6 10.5C6 14.8 12 21 12 21Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="10.5" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <span>Tulip Pharmacy, Oluwo</span>
          </div>
          <div className="ride-card__row">
            <span className="ride-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M12 7v5l3 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>Now</span>
          </div>
          <div className="ride-card__row">
            <span className="ride-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M7 7V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 17 5v2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <span>₦1,500</span>
          </div>
        </div>

        <div className="ride-card__buttons">
          <button
            type="button"
            className="ride-card__btn ride-card__btn--decline"
            onClick={() => console.log("Decline")}
          >
            Decline
          </button>
          <button
            type="button"
            className="ride-card__btn ride-card__btn--accept"
            onClick={() => console.log("Accept")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
