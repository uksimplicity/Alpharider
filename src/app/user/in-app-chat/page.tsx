"use client";

import { useRouter } from "next/navigation";

export default function InAppChatPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card user-chat-card">
        <header className="user-chat-header">
          <button
            className="user-header-button"
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="user-chat-title">
            <img className="user-chat-avatar" src="/icons/user.svg" alt="Moses" />
            <div>
              <p className="user-chat-name">Moses</p>
              <p className="user-chat-status">Online</p>
            </div>
          </div>

          <button className="user-header-button" type="button" aria-label="Call">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6.6 2.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-1.6 1.6c1.2 2.3 3.2 4.3 5.6 5.6l1.6-1.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-2 2c-.7.7-1.8 1-2.8.8-6.6-1.4-11.8-6.6-13.2-13.2-.2-1 .1-2.1.8-2.8l2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </header>

        <div className="user-chat-body">
          <div className="user-chat-bubble incoming">
            <p>Hello, I am on my way.</p>
            <span>2:15 PM</span>
          </div>
          <div className="user-chat-bubble outgoing">
            <p>Great. Please use the main gate.</p>
            <span>2:16 PM</span>
          </div>
          <div className="user-chat-bubble incoming">
            <p>I am close to the roundabout.</p>
            <span>2:18 PM</span>
          </div>
          <div className="user-chat-bubble outgoing">
            <p>Okay, I will be outside.</p>
            <span>2:19 PM</span>
          </div>
        </div>

        <form
          className="user-chat-input"
          onSubmit={(event) => event.preventDefault()}
        >
          <input type="text" placeholder="Type a message" />
          <button type="submit" aria-label="Send">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M20 12L4 4l6 8-6 8 16-8Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
